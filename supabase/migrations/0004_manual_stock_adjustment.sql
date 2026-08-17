-- Manual inventory adjustments (found stock, damaged goods, stock-count corrections) need
-- the same SECURITY DEFINER treatment as receive_purchase_order/deduct_fifo: staff have no
-- direct INSERT policy on stock_lots/inventory_movements, by design, so FIFO integrity can't
-- be bypassed by a raw REST call.
create or replace function adjust_stock(
  p_product_id uuid,
  p_variant_id uuid,
  p_direction text,
  p_qty integer,
  p_reason text,
  p_notes text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_avg_cost numeric;
  v_lot_id uuid;
  v_lot record;
  v_take integer;
  v_remaining integer;
begin
  if coalesce(app_role(), '') not in ('admin','staff') then
    raise exception 'not authorized';
  end if;
  if p_direction not in ('in','out') then
    raise exception 'invalid direction';
  end if;
  if p_reason not in ('adjustment','damaged') then
    raise exception 'invalid reason';
  end if;
  if p_qty is null or p_qty <= 0 then
    raise exception 'invalid quantity';
  end if;

  if p_direction = 'in' then
    select coalesce(sum(qty_remaining * unit_cost) / nullif(sum(qty_remaining), 0), 0)
      into v_avg_cost
      from stock_lots where product_id = p_product_id and variant_id is not distinct from p_variant_id;

    insert into stock_lots (product_id, variant_id, qty_received, qty_remaining, unit_cost)
    values (p_product_id, p_variant_id, p_qty, p_qty, coalesce(v_avg_cost, 0))
    returning id into v_lot_id;

    insert into inventory_movements
      (product_id, variant_id, stock_lot_id, direction, qty, reason, unit_cost, source_type, notes, created_by)
    values
      (p_product_id, p_variant_id, v_lot_id, 'in', p_qty, p_reason, coalesce(v_avg_cost, 0), 'manual', p_notes, auth.uid());
  else
    v_remaining := p_qty;
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
        (product_id, variant_id, stock_lot_id, direction, qty, reason, unit_cost, source_type, notes, created_by)
      values
        (p_product_id, p_variant_id, v_lot.id, 'out', v_take, p_reason, v_lot.unit_cost, 'manual', p_notes, auth.uid());
      v_remaining := v_remaining - v_take;
    end loop;

    if v_remaining > 0 then
      raise exception 'Insufficient stock to remove % units (short by %)', p_qty, v_remaining;
    end if;
  end if;
end; $$;

revoke execute on function adjust_stock(uuid, uuid, text, integer, text, text) from anon;
