-- Critical security fix: every prior migration did
--   revoke execute on function X(...) from anon, authenticated;
-- but PostgreSQL grants EXECUTE to the implicit PUBLIC pseudo-role on function
-- creation, and revoking from anon/authenticated does NOT revoke the PUBLIC grant —
-- PUBLIC-granted privileges apply to every role regardless of other revokes. Verified
-- live: has_function_privilege('anon', 'deduct_fifo', 'EXECUTE') was true despite the
-- 0002 revoke. deduct_fifo in particular has NO internal role check (unlike its
-- siblings), so this was a live, unauthenticated stock-draining hole.
--
-- Fix: explicitly revoke from PUBLIC on every internal-only function, and add the
-- same defense-in-depth app_role() check deduct_fifo's siblings already have — so a
-- future grant regression can't reopen this by itself.

revoke execute on function deduct_fifo(uuid, uuid, integer, uuid) from public;
revoke execute on function handle_new_user() from public;
revoke execute on function prevent_role_self_escalation() from public;
revoke execute on function receive_purchase_order(uuid) from public;
revoke execute on function confirm_sales_order(uuid) from public;
revoke execute on function cancel_sales_order(uuid) from public;
revoke execute on function mark_sales_order_done(uuid) from public;
revoke execute on function adjust_stock(uuid, uuid, text, integer, text, text) from public;
revoke execute on function set_user_role(uuid, text) from public;
revoke execute on function cancel_own_sales_order(uuid) from public;
revoke execute on function create_sales_order(jsonb, text, text, text, text) from public;

-- create_sales_order is meant to stay callable by any authenticated customer.
grant execute on function create_sales_order(jsonb, text, text, text, text) to authenticated;
grant execute on function cancel_own_sales_order(uuid) to authenticated;

-- deduct_fifo is only ever called internally by mark_sales_order_done() — a
-- function-to-function call inside the same PL/pgSQL execution, which needs no
-- grant at all. It should never be reachable as a direct PostgREST RPC call by
-- anyone. Add the same guard every sibling admin/staff function already has, so
-- even a future grant regression can't turn this back into a live hole.
create or replace function deduct_fifo(
  p_product_id uuid, p_variant_id uuid, p_qty integer, p_source_item_id uuid
) returns numeric
language plpgsql security definer set search_path = public as $$
declare
  v_lot record;
  v_take integer;
  v_remaining integer := p_qty;
  v_cost numeric := 0;
begin
  if coalesce(app_role(), '') not in ('admin','staff') then
    raise exception 'not authorized';
  end if;

  for v_lot in
    select * from stock_lots
    where product_id = p_product_id
      and variant_id is not distinct from p_variant_id
      and qty_remaining > 0
    order by received_date asc, created_at asc
    for update
  loop
    exit when v_remaining <= 0;
    v_take := least(v_remaining, v_lot.qty_remaining);
    update stock_lots set qty_remaining = qty_remaining - v_take where id = v_lot.id;
    insert into inventory_movements
      (product_id, variant_id, stock_lot_id, direction, qty, reason, unit_cost, source_type, source_id)
    values
      (p_product_id, p_variant_id, v_lot.id, 'out', v_take, 'sale-completed', v_lot.unit_cost,
       'sales_order_item', p_source_item_id);
    v_cost := v_cost + (v_take * v_lot.unit_cost);
    v_remaining := v_remaining - v_take;
  end loop;

  if v_remaining > 0 then
    raise exception 'Insufficient stock for product % variant % (short by %)',
      p_product_id, p_variant_id, v_remaining;
  end if;
  return v_cost;
end; $$;

-- Task: add a stock check to create_sales_order() so overselling fails clearly at
-- checkout time instead of surfacing as a raw exception days later when staff try
-- to mark the order Done. Uses the same on-hand-minus-reserved-open-orders formula
-- get_available_qty() already implements, but excludes the order being created
-- (it doesn't exist yet, so nothing to exclude — this is a pre-insert check).
create or replace function create_sales_order(
  p_items jsonb, p_fulfillment_method text, p_delivery_address text,
  p_payment_method text, p_payment_screenshot_path text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid := auth.uid();
  v_order_id uuid;
  v_item jsonb;
  v_product products%rowtype;
  v_variant product_variants%rowtype;
  v_variant_id uuid;
  v_unit_price numeric;
  v_qty integer;
  v_line_total numeric;
  v_subtotal numeric := 0;
  v_delivery_fee numeric := 0;
  v_name_ar text;
  v_name_en text;
  v_item_count integer := 0;
  v_available integer;
begin
  if v_customer_id is null then
    raise exception 'must be authenticated';
  end if;
  if p_fulfillment_method not in ('pickup','delivery') then
    raise exception 'invalid fulfillment method';
  end if;
  if p_payment_method not in ('cash','instapay','vodafone_cash','other_wallet') then
    raise exception 'invalid payment method';
  end if;
  if p_fulfillment_method = 'delivery' and (p_delivery_address is null or length(trim(p_delivery_address)) = 0) then
    raise exception 'delivery address required';
  end if;
  if p_payment_method <> 'cash' and (p_payment_screenshot_path is null or length(trim(p_payment_screenshot_path)) = 0) then
    raise exception 'payment screenshot required for transfer payments';
  end if;

  if p_fulfillment_method = 'delivery' then
    select coalesce((value->>'amount')::numeric, 0) into v_delivery_fee from settings where key = 'delivery_fee';
  end if;

  insert into sales_orders
    (customer_id, status, fulfillment_method, delivery_address, delivery_fee, payment_method, payment_screenshot_url, subtotal, total)
  values
    (v_customer_id, 'new', p_fulfillment_method, p_delivery_address, v_delivery_fee, p_payment_method, p_payment_screenshot_path, 0, 0)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_item_count := v_item_count + 1;

    select * into v_product from products where id = (v_item->>'product_id')::uuid and is_active = true;
    if not found then
      raise exception 'product not found';
    end if;

    v_qty := (v_item->>'qty')::integer;
    if v_qty is null or v_qty <= 0 or v_qty > 1000 then
      raise exception 'invalid quantity';
    end if;

    v_variant_id := nullif(v_item->>'variant_id', '')::uuid;
    if v_variant_id is not null then
      select * into v_variant from product_variants where id = v_variant_id and product_id = v_product.id;
      if not found then
        raise exception 'variant not found';
      end if;
      v_unit_price := coalesce(v_variant.price, v_product.price);
      v_name_ar := v_product.name_ar || ' — ' || v_variant.name_ar;
      v_name_en := v_product.name_en || ' — ' || v_variant.name_en;
    else
      v_unit_price := v_product.price;
      v_name_ar := v_product.name_ar;
      v_name_en := v_product.name_en;
    end if;

    -- Stock check: only for real, stocked items (pricing_unit = 'item'). Page/job
    -- pricing (printing services) and combos with combo_force_available are
    -- on-demand, not stocked, so skip them — mirrors the storefront's own
    -- getCardAvailability() logic (lib/data/availability.ts).
    if v_product.pricing_unit = 'item' and v_product.type <> 'combo' then
      v_available := get_available_qty(v_product.id, v_variant_id);
      if v_available < v_qty then
        raise exception 'Not enough stock for %: only % available', coalesce(v_name_en, v_product.name_en), v_available
          using errcode = 'P0001', hint = 'insufficient_stock';
      end if;
    end if;

    v_line_total := v_unit_price * v_qty;
    v_subtotal := v_subtotal + v_line_total;

    insert into sales_order_items
      (sales_order_id, product_id, variant_id, name_snapshot_ar, name_snapshot_en, unit_price, qty, line_total)
    values
      (v_order_id, v_product.id, v_variant_id, v_name_ar, v_name_en, v_unit_price, v_qty, v_line_total);
  end loop;

  if v_item_count = 0 then
    raise exception 'order must have at least one item';
  end if;

  update sales_orders set subtotal = v_subtotal, total = v_subtotal + v_delivery_fee where id = v_order_id;

  return v_order_id;
end; $$;

-- Fixes the storefront "always out of stock" bug: getAvailabilityMap() previously
-- read stock_lots/sales_orders/sales_order_items directly through the anon client,
-- but those tables are RLS-locked to admin/staff/order-owner — so every anonymous
-- or customer page load computed on-hand as 0 for everything. This RPC returns only
-- the aggregated available-quantity numbers (never raw lot rows, which carry
-- unit_cost — real COGS data that must not be public), safe for anon/authenticated.
create or replace function get_availability_snapshot()
returns table(product_id uuid, variant_id uuid, available integer)
language sql stable security definer set search_path = public as $$
  with on_hand as (
    select sl.product_id, sl.variant_id, sum(sl.qty_remaining) as qty
    from stock_lots sl
    group by sl.product_id, sl.variant_id
  ),
  reserved as (
    select soi.product_id, soi.variant_id, sum(soi.qty) as qty
    from sales_order_items soi
    join sales_orders so on so.id = soi.sales_order_id
    where so.status in ('new', 'confirmed')
    group by soi.product_id, soi.variant_id
  ),
  base as (
    select coalesce(oh.product_id, r.product_id) as product_id,
           coalesce(oh.variant_id, r.variant_id) as variant_id,
           coalesce(oh.qty, 0) - coalesce(r.qty, 0) as available
    from on_hand oh
    full outer join reserved r
      on r.product_id = oh.product_id and r.variant_id is not distinct from oh.variant_id
  )
  select b.product_id, b.variant_id, b.available::integer from base b
  union all
  -- Combo products: force-available combos are unlimited; others are the minimum
  -- across components of floor(component_available / qty_per_combo).
  select p.id, null::uuid,
    case
      when p.combo_force_available then 2147483647
      when not exists (select 1 from product_combo_components c where c.combo_product_id = p.id) then 2147483647
      else (
        select min(floor(coalesce(b.available, 0)::numeric / c.qty))::integer
        from product_combo_components c
        left join base b
          on b.product_id = c.component_product_id and b.variant_id is not distinct from c.component_variant_id
        where c.combo_product_id = p.id
      )
    end
  from products p
  where p.type = 'combo';
$$;

revoke execute on function get_availability_snapshot() from public;
grant execute on function get_availability_snapshot() to anon, authenticated;
