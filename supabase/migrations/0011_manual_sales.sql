-- Manual (walk-in / in-person) sales entry for staff.
-- Mirrors create_sales_order()'s authoritative catalog pricing (migration 0003) but skips
-- checkout-only concerns (delivery, payment screenshot) and completes the sale immediately
-- via mark_sales_order_done() so it deducts stock and posts to the ledger right away —
-- exactly like a customer checkout, just entered by staff on the customer's behalf.
create or replace function create_manual_sale(
  p_items jsonb,
  p_payment_method text,
  p_notes text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product products%rowtype;
  v_variant product_variants%rowtype;
  v_variant_id uuid;
  v_unit_price numeric;
  v_qty integer;
  v_line_total numeric;
  v_subtotal numeric := 0;
  v_name_ar text;
  v_name_en text;
  v_item_count integer := 0;
begin
  if app_role() not in ('admin','staff') then
    raise exception 'not authorized';
  end if;
  if p_payment_method not in ('cash','instapay','vodafone_cash','other_wallet') then
    raise exception 'invalid payment method';
  end if;

  insert into sales_orders
    (customer_id, status, fulfillment_method, payment_method, subtotal, total, notes)
  values
    (auth.uid(), 'new', 'pickup', p_payment_method, 0, 0, nullif(p_notes, ''))
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

  update sales_orders set subtotal = v_subtotal, total = v_subtotal where id = v_order_id;

  perform mark_sales_order_done(v_order_id);

  return v_order_id;
end; $$;

revoke execute on function create_manual_sale(jsonb, text, text) from anon;
