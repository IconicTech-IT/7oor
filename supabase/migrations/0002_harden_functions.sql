-- Hardening pass applied after 0001_init.sql:
-- 1. Lock down internal-only RPCs from direct PostgREST access.
-- 2. Fix a NULL-bypasses-authorization bug: `IF app_role() NOT IN (...)` evaluates to
--    NULL (not TRUE) for an unauthenticated caller, and PL/pgSQL treats a NULL
--    condition as false — silently skipping the check. Wrapped in coalesce() so an
--    unauthenticated/roleless caller is explicitly rejected instead of let through.

revoke execute on function deduct_fifo(uuid, uuid, integer, uuid) from anon, authenticated;
revoke execute on function handle_new_user() from anon, authenticated;

create or replace function get_available_qty(p_product_id uuid, p_variant_id uuid) returns integer
language sql stable set search_path = public as $$
  select coalesce((select sum(qty_remaining) from stock_lots
                    where product_id = p_product_id and variant_id is not distinct from p_variant_id), 0)
       - coalesce((select sum(soi.qty) from sales_order_items soi
                    join sales_orders so on so.id = soi.sales_order_id
                    where soi.product_id = p_product_id
                      and soi.variant_id is not distinct from p_variant_id
                      and so.status in ('new','confirmed')), 0);
$$;

create or replace function receive_purchase_order(p_purchase_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_item record;
  v_lot_id uuid;
begin
  if coalesce(app_role(), '') not in ('admin','staff') then
    raise exception 'not authorized';
  end if;

  for v_item in select * from purchase_order_items where purchase_order_id = p_purchase_order_id loop
    insert into stock_lots (product_id, variant_id, qty_received, qty_remaining, unit_cost, purchase_order_item_id)
    values (v_item.product_id, v_item.variant_id, v_item.qty_ordered, v_item.qty_ordered, v_item.unit_cost, v_item.id)
    returning id into v_lot_id;

    update purchase_order_items set qty_received = qty_ordered where id = v_item.id;

    insert into inventory_movements
      (product_id, variant_id, stock_lot_id, direction, qty, reason, unit_cost, source_type, source_id, created_by)
    values
      (v_item.product_id, v_item.variant_id, v_lot_id, 'in', v_item.qty_ordered, 'purchase-received',
       v_item.unit_cost, 'purchase_order_item', v_item.id, auth.uid());
  end loop;

  update purchase_orders set status = 'received', received_at = now(), updated_at = now()
    where id = p_purchase_order_id;
end; $$;

create or replace function confirm_sales_order(p_sales_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(app_role(), '') not in ('admin','staff') then
    raise exception 'not authorized';
  end if;

  update sales_orders set status = 'confirmed', confirmed_at = now(), updated_at = now()
    where id = p_sales_order_id and status = 'new';

  insert into invoices (sales_order_id)
    select p_sales_order_id where not exists (select 1 from invoices where sales_order_id = p_sales_order_id);
end; $$;

create or replace function cancel_sales_order(p_sales_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(app_role(), '') not in ('admin','staff') then
    raise exception 'not authorized';
  end if;

  update sales_orders set status = 'cancelled', cancelled_at = now(), updated_at = now()
    where id = p_sales_order_id and status in ('new','confirmed');
end; $$;

create or replace function mark_sales_order_done(p_sales_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_order sales_orders%rowtype;
  v_item sales_order_items%rowtype;
  v_component record;
  v_product_type text;
  v_line_cogs numeric;
  v_total_cogs numeric := 0;
  v_total_revenue numeric := 0;
begin
  if coalesce(app_role(), '') not in ('admin','staff') then
    raise exception 'not authorized';
  end if;

  select * into v_order from sales_orders where id = p_sales_order_id for update;
  if not found or v_order.status not in ('new','confirmed') then
    raise exception 'Order % is not completable', p_sales_order_id;
  end if;

  if v_order.status = 'new' then
    perform confirm_sales_order(p_sales_order_id);
  end if;

  for v_item in select * from sales_order_items where sales_order_id = p_sales_order_id loop
    select type into v_product_type from products where id = v_item.product_id;

    if v_product_type = 'combo' then
      v_line_cogs := 0;
      for v_component in
        select component_product_id, component_variant_id, qty
        from product_combo_components where combo_product_id = v_item.product_id
      loop
        v_line_cogs := v_line_cogs + deduct_fifo(
          v_component.component_product_id, v_component.component_variant_id,
          v_component.qty * v_item.qty, v_item.id);
      end loop;
    else
      v_line_cogs := deduct_fifo(v_item.product_id, v_item.variant_id, v_item.qty, v_item.id);
    end if;

    update sales_order_items set cogs_total = v_line_cogs where id = v_item.id;
    v_total_cogs := v_total_cogs + v_line_cogs;
    v_total_revenue := v_total_revenue + v_item.line_total;
  end loop;

  update sales_orders set status = 'done', done_at = now(), updated_at = now() where id = p_sales_order_id;
  update invoices set status = 'paid', paid_at = now() where sales_order_id = p_sales_order_id and status = 'unpaid';

  insert into ledger_entries (type, amount, description, source_type, source_id, created_by) values
    ('revenue', v_total_revenue + v_order.delivery_fee, 'Sale ' || v_order.order_number, 'sales_order', p_sales_order_id, auth.uid()),
    ('cogs', v_total_cogs, 'COGS for ' || v_order.order_number, 'sales_order', p_sales_order_id, auth.uid());
end; $$;
