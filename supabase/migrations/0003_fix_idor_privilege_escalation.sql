-- Security fixes found in review: RLS is row-level only, so "auth.uid() = id" style
-- policies do not stop a customer from writing to columns they should never control.

-- 1) profiles.role: block self-escalation via trigger (RLS can't do column-level checks).
create or replace function prevent_role_self_escalation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and coalesce(app_role(), '') <> 'admin' then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end; $$;

drop trigger if exists trg_prevent_role_escalation on profiles;
create trigger trg_prevent_role_escalation before update on profiles
  for each row execute function prevent_role_self_escalation();

-- 2) sales_orders / sales_order_items: a direct client insert could set any
--    unit_price/line_total it likes. Drop direct-insert policies — all order creation
--    goes through create_sales_order(), which prices items from the catalog itself.
drop policy if exists "customer create own orders" on sales_orders;
drop policy if exists "customer insert own items" on sales_order_items;

-- 3) invoices: a direct client insert could forge status='paid'. Only
--    confirm_sales_order()/mark_sales_order_done() (SECURITY DEFINER) create invoices.
drop policy if exists "customer insert own invoice" on invoices;

-- 4) requests: a customer can create their own request, but not pre-set its status.
drop policy if exists "customer create own requests" on requests;
create policy "customer create own requests" on requests for insert
  with check (customer_id = auth.uid() and status = 'new');

-- 5) Trusted order-creation RPC — the only path to insert sales_orders/sales_order_items.
-- Client supplies product/variant ids + quantities only; price is looked up here.
create or replace function create_sales_order(
  p_items jsonb,
  p_fulfillment_method text,
  p_delivery_address text,
  p_payment_method text,
  p_payment_screenshot_path text
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

-- 6) Lock down trigger-only / auth-gated functions from direct PostgREST RPC access.
revoke execute on function prevent_role_self_escalation() from anon, authenticated;
revoke execute on function handle_new_user() from anon, authenticated;
revoke execute on function create_sales_order(jsonb, text, text, text, text) from anon;
