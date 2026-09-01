-- Flat (amount, not percentage) discount for manual sales, plus a source flag so admins can
-- tell walk-in ("manual") sales apart from website ("online") checkouts in the orders list.
alter table sales_orders add column discount numeric(12,2) not null default 0 check (discount >= 0);
alter table sales_orders add column source text not null default 'online' check (source in ('online','manual'));

-- Changing create_manual_sale's signature (adding p_discount) creates a new overload rather
-- than replacing the old one, since Postgres identifies functions by argument types — drop
-- the old (jsonb, text, text) signature explicitly so it doesn't linger unused.
drop function if exists create_manual_sale(jsonb, text, text);

-- Re-post revenue net of the order's discount so accounting reflects what was actually charged.
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
  if app_role() not in ('admin','staff') then
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
    ('revenue', v_total_revenue + v_order.delivery_fee - v_order.discount, 'Sale ' || v_order.order_number, 'sales_order', p_sales_order_id, auth.uid()),
    ('cogs', v_total_cogs, 'COGS for ' || v_order.order_number, 'sales_order', p_sales_order_id, auth.uid());
end; $$;

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

  if p_discount > v_subtotal then
    raise exception 'discount cannot exceed subtotal';
  end if;

  update sales_orders set subtotal = v_subtotal, total = v_subtotal - p_discount where id = v_order_id;

  perform mark_sales_order_done(v_order_id);

  return v_order_id;
end; $$;

revoke execute on function create_manual_sale(jsonb, text, numeric, text) from anon;
