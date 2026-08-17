-- The spec calls for Purchase Orders to post as "bills/expenses" once received, at actual
-- lot cost — receive_purchase_order() built the stock_lots but never posted the ledger
-- entry. Add it here.
create or replace function receive_purchase_order(p_purchase_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_item record;
  v_lot_id uuid;
  v_total_cost numeric := 0;
  v_po_number text;
begin
  if coalesce(app_role(), '') not in ('admin','staff') then
    raise exception 'not authorized';
  end if;

  select po_number into v_po_number from purchase_orders where id = p_purchase_order_id;

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

    v_total_cost := v_total_cost + (v_item.qty_ordered * v_item.unit_cost);
  end loop;

  update purchase_orders set status = 'received', received_at = now(), updated_at = now()
    where id = p_purchase_order_id;

  if v_total_cost > 0 then
    insert into ledger_entries (type, amount, description, source_type, source_id, created_by)
    values ('expense', v_total_cost, 'Purchase ' || v_po_number, 'purchase_order', p_purchase_order_id, auth.uid());
  end if;
end; $$;
