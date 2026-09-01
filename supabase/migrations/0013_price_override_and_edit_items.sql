-- Let staff override the catalog price per line (manual sales only — checkout still trusts
-- only the catalog, see create_sales_order), and let staff edit an order's items (add/remove/
-- requantify) while it's still 'new' or 'confirmed' — i.e. before mark_sales_order_done() has
-- touched stock or accounting, so an edit at this stage needs no ledger/inventory reversal at
-- all; the eventual completion simply posts whatever the final item list says.
create or replace function create_manual_sale(
  p_items jsonb,
  p_payment_method text,
  p_discount numeric default 0,
  p_notes text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_product products%rowtype;
  v_variant product_variants%rowtype;
  v_variant_id uuid;
  v_catalog_price numeric;
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
  if p_discount is null or p_discount < 0 then
    raise exception 'invalid discount';
  end if;

  insert into sales_orders
    (customer_id, status, fulfillment_method, payment_method, subtotal, total, notes, discount, source)
  values
    (auth.uid(), 'new', 'pickup', p_payment_method, 0, 0, nullif(p_notes, ''), p_discount, 'manual')
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
      v_catalog_price := coalesce(v_variant.price, v_product.price);
      v_name_ar := v_product.name_ar || ' — ' || v_variant.name_ar;
      v_name_en := v_product.name_en || ' — ' || v_variant.name_en;
    else
      v_catalog_price := v_product.price;
      v_name_ar := v_product.name_ar;
      v_name_en := v_product.name_en;
    end if;

    v_unit_price := coalesce(nullif(v_item->>'unit_price', '')::numeric, v_catalog_price);
    if v_unit_price < 0 then
      raise exception 'invalid unit price';
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

  if p_discount > v_subtotal then
    raise exception 'discount cannot exceed subtotal';
  end if;

  update sales_orders set subtotal = v_subtotal, total = v_subtotal - p_discount where id = v_order_id;

  perform mark_sales_order_done(v_order_id);

  return v_order_id;
end; $$;

create or replace function update_sales_order_items(p_sales_order_id uuid, p_items jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_order sales_orders%rowtype;
  v_item jsonb;
  v_product products%rowtype;
  v_variant product_variants%rowtype;
  v_variant_id uuid;
  v_catalog_price numeric;
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

  select * into v_order from sales_orders where id = p_sales_order_id for update;
  if not found or v_order.status not in ('new','confirmed') then
    raise exception 'Order % can no longer be edited', p_sales_order_id;
  end if;

  delete from sales_order_items where sales_order_id = p_sales_order_id;

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
      v_catalog_price := coalesce(v_variant.price, v_product.price);
      v_name_ar := v_product.name_ar || ' — ' || v_variant.name_ar;
      v_name_en := v_product.name_en || ' — ' || v_variant.name_en;
    else
      v_catalog_price := v_product.price;
      v_name_ar := v_product.name_ar;
      v_name_en := v_product.name_en;
    end if;

    v_unit_price := coalesce(nullif(v_item->>'unit_price', '')::numeric, v_catalog_price);
    if v_unit_price < 0 then
      raise exception 'invalid unit price';
    end if;

    v_line_total := v_unit_price * v_qty;
    v_subtotal := v_subtotal + v_line_total;

    insert into sales_order_items
      (sales_order_id, product_id, variant_id, name_snapshot_ar, name_snapshot_en, unit_price, qty, line_total)
    values
      (p_sales_order_id, v_product.id, v_variant_id, v_name_ar, v_name_en, v_unit_price, v_qty, v_line_total);
  end loop;

  if v_item_count = 0 then
    raise exception 'order must have at least one item';
  end if;

  if v_order.discount > v_subtotal then
    raise exception 'discount cannot exceed subtotal';
  end if;

  update sales_orders
    set subtotal = v_subtotal, total = v_subtotal + v_order.delivery_fee - v_order.discount, updated_at = now()
    where id = p_sales_order_id;
end; $$;

revoke execute on function update_sales_order_items(uuid, jsonb) from anon;
