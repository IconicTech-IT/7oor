-- 7oor Store — initial schema
-- Roles, catalog, purchases, FIFO inventory, sales, accounting, requests, settings.

create extension if not exists pgcrypto;

-- ============================================================
-- ROLES / PROFILES
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('admin','staff','customer')),
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create or replace function app_role() returns text
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

alter table profiles enable row level security;
create policy "self read" on profiles for select using (auth.uid() = id or app_role() = 'admin');
create policy "self update" on profiles for update using (auth.uid() = id or app_role() = 'admin');
create policy "admin insert profiles" on profiles for insert with check (app_role() = 'admin' or auth.uid() = id);

-- ============================================================
-- CATALOG
-- ============================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references categories(id) on delete set null,
  name_ar text not null,
  name_en text not null,
  slug text unique not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_categories_parent on categories(parent_id);

alter table categories enable row level security;
create policy "public read categories" on categories for select using (true);
create policy "staff write categories" on categories for all
  using (app_role() in ('admin','staff')) with check (app_role() in ('admin','staff'));

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  type text not null default 'simple' check (type in ('simple','combo','custom_request')),
  pricing_unit text not null default 'item' check (pricing_unit in ('item','page','job')),
  name_ar text not null,
  name_en text not null,
  slug text unique not null,
  short_description_ar text,
  short_description_en text,
  description_ar text,
  description_en text,
  price numeric(12,2) not null default 0,
  image_url text,
  is_active boolean not null default true,
  combo_force_available boolean not null default false,
  low_stock_threshold integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_category on products(category_id);
create index idx_products_type on products(type);
create index idx_products_active on products(is_active);

alter table products enable row level security;
create policy "public read active products" on products for select
  using (is_active or app_role() in ('admin','staff'));
create policy "staff write products" on products for all
  using (app_role() in ('admin','staff')) with check (app_role() in ('admin','staff'));

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name_ar text not null,
  name_en text not null,
  sku text unique,
  color_hex text,
  price numeric(12,2),
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_variants_product on product_variants(product_id);

alter table product_variants enable row level security;
create policy "public read variants" on product_variants for select using (true);
create policy "staff write variants" on product_variants for all
  using (app_role() in ('admin','staff')) with check (app_role() in ('admin','staff'));

create table product_combo_components (
  id uuid primary key default gen_random_uuid(),
  combo_product_id uuid not null references products(id) on delete cascade,
  component_product_id uuid not null references products(id),
  component_variant_id uuid references product_variants(id),
  qty integer not null check (qty > 0),
  created_at timestamptz not null default now()
);
create index idx_combo_parent on product_combo_components(combo_product_id);
create index idx_combo_component on product_combo_components(component_product_id);

alter table product_combo_components enable row level security;
create policy "public read combo components" on product_combo_components for select using (true);
create policy "staff write combo components" on product_combo_components for all
  using (app_role() in ('admin','staff')) with check (app_role() in ('admin','staff'));

-- ============================================================
-- SUPPLIERS / PURCHASES
-- ============================================================
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default now()
);

alter table suppliers enable row level security;
create policy "staff manage suppliers" on suppliers for all
  using (app_role() in ('admin','staff')) with check (app_role() in ('admin','staff'));

create sequence purchase_order_seq;
create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique default ('PO-' || lpad(nextval('purchase_order_seq')::text, 6, '0')),
  supplier_id uuid references suppliers(id),
  status text not null default 'draft' check (status in ('draft','ordered','received')),
  ordered_at timestamptz,
  received_at timestamptz,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_po_supplier on purchase_orders(supplier_id);

alter table purchase_orders enable row level security;
create policy "staff manage purchase orders" on purchase_orders for all
  using (app_role() in ('admin','staff')) with check (app_role() in ('admin','staff'));

create table purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  product_id uuid not null references products(id),
  variant_id uuid references product_variants(id),
  qty_ordered integer not null check (qty_ordered > 0),
  qty_received integer not null default 0,
  unit_cost numeric(12,2) not null,
  created_at timestamptz not null default now()
);
create index idx_poi_po on purchase_order_items(purchase_order_id);
create index idx_poi_product on purchase_order_items(product_id);

alter table purchase_order_items enable row level security;
create policy "staff manage po items" on purchase_order_items for all
  using (app_role() in ('admin','staff')) with check (app_role() in ('admin','staff'));

-- ============================================================
-- INVENTORY (FIFO lots + movements)
-- ============================================================
create table stock_lots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  variant_id uuid references product_variants(id),
  qty_received integer not null,
  qty_remaining integer not null check (qty_remaining >= 0),
  unit_cost numeric(12,2) not null,
  received_date timestamptz not null default now(),
  purchase_order_item_id uuid references purchase_order_items(id),
  created_at timestamptz not null default now()
);
create index idx_lots_product_variant_date on stock_lots(product_id, variant_id, received_date);

alter table stock_lots enable row level security;
create policy "staff read stock lots" on stock_lots for select using (app_role() in ('admin','staff'));
-- lots are only mutated via SECURITY DEFINER functions (receive_purchase_order / deduct_fifo)

create table inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  variant_id uuid references product_variants(id),
  stock_lot_id uuid references stock_lots(id),
  direction text not null check (direction in ('in','out')),
  qty integer not null check (qty > 0),
  reason text not null check (reason in ('purchase-received','sale-completed','adjustment','damaged','return')),
  unit_cost numeric(12,2),
  source_type text check (source_type in ('sales_order_item','purchase_order_item','manual')),
  source_id uuid,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_movements_product_variant on inventory_movements(product_id, variant_id);
create index idx_movements_created on inventory_movements(created_at);

alter table inventory_movements enable row level security;
create policy "staff read movements" on inventory_movements for select using (app_role() in ('admin','staff'));

-- ============================================================
-- SALES
-- ============================================================
create sequence sales_order_seq;
create table sales_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('SO-' || lpad(nextval('sales_order_seq')::text, 6, '0')),
  customer_id uuid not null references profiles(id),
  status text not null default 'new' check (status in ('new','confirmed','done','cancelled')),
  fulfillment_method text not null check (fulfillment_method in ('pickup','delivery')),
  delivery_address text,
  delivery_fee numeric(12,2) not null default 0,
  payment_method text not null check (payment_method in ('cash','instapay','vodafone_cash','other_wallet')),
  payment_screenshot_url text,
  subtotal numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  done_at timestamptz,
  cancelled_at timestamptz
);
create index idx_so_customer on sales_orders(customer_id);
create index idx_so_status on sales_orders(status);

alter table sales_orders enable row level security;
create policy "customer read own orders" on sales_orders for select
  using (customer_id = auth.uid() or app_role() in ('admin','staff'));
create policy "customer create own orders" on sales_orders for insert
  with check (customer_id = auth.uid());
create policy "staff update orders" on sales_orders for update
  using (app_role() in ('admin','staff'));

create table sales_order_items (
  id uuid primary key default gen_random_uuid(),
  sales_order_id uuid not null references sales_orders(id) on delete cascade,
  product_id uuid not null references products(id),
  variant_id uuid references product_variants(id),
  name_snapshot_ar text not null,
  name_snapshot_en text not null,
  unit_price numeric(12,2) not null,
  qty integer not null check (qty > 0),
  line_total numeric(12,2) not null,
  cogs_total numeric(12,2),
  created_at timestamptz not null default now()
);
create index idx_soi_order on sales_order_items(sales_order_id);
create index idx_soi_product on sales_order_items(product_id);

alter table sales_order_items enable row level security;
create policy "read items of visible orders" on sales_order_items for select
  using (exists (select 1 from sales_orders so where so.id = sales_order_id
                 and (so.customer_id = auth.uid() or app_role() in ('admin','staff'))));
create policy "customer insert own items" on sales_order_items for insert
  with check (exists (select 1 from sales_orders so where so.id = sales_order_id and so.customer_id = auth.uid()));
create policy "staff update items" on sales_order_items for update using (app_role() in ('admin','staff'));

create sequence invoice_seq;
create table invoices (
  id uuid primary key default gen_random_uuid(),
  sales_order_id uuid not null unique references sales_orders(id),
  invoice_number text not null unique default ('INV-' || lpad(nextval('invoice_seq')::text, 6, '0')),
  status text not null default 'unpaid' check (status in ('unpaid','paid')),
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_invoices_order on invoices(sales_order_id);

alter table invoices enable row level security;
create policy "read own invoices" on invoices for select
  using (exists (select 1 from sales_orders so where so.id = sales_order_id
                 and (so.customer_id = auth.uid() or app_role() in ('admin','staff'))));
create policy "staff write invoices" on invoices for all
  using (app_role() in ('admin','staff')) with check (app_role() in ('admin','staff'));
create policy "customer insert own invoice" on invoices for insert
  with check (exists (select 1 from sales_orders so where so.id = sales_order_id and so.customer_id = auth.uid()));

-- ============================================================
-- ACCOUNTING
-- ============================================================
create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date timestamptz not null default now(),
  type text not null check (type in ('revenue','cogs','expense','payment_received','payment_made')),
  amount numeric(12,2) not null,
  description text,
  source_type text check (source_type in ('sales_order','purchase_order','invoice','bill','manual')),
  source_id uuid,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_ledger_date on ledger_entries(entry_date);
create index idx_ledger_source on ledger_entries(source_type, source_id);

alter table ledger_entries enable row level security;
create policy "admin only ledger" on ledger_entries for all
  using (app_role() = 'admin') with check (app_role() = 'admin');

-- ============================================================
-- REQUESTS
-- ============================================================
create table requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id),
  category text,
  name text not null,
  contact text not null,
  description text not null,
  qty_or_budget text,
  fulfillment_method text check (fulfillment_method in ('pickup','delivery')),
  delivery_address text,
  attachment_url text,
  status text not null default 'new' check (status in ('new','in_review','quoted','accepted','rejected','completed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_requests_customer on requests(customer_id);
create index idx_requests_status on requests(status);

alter table requests enable row level security;
create policy "customer read own requests" on requests for select
  using (customer_id = auth.uid() or app_role() in ('admin','staff'));
create policy "customer create own requests" on requests for insert
  with check (customer_id = auth.uid());
create policy "staff update requests" on requests for update
  using (app_role() in ('admin','staff'));

-- ============================================================
-- SETTINGS
-- ============================================================
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;
create policy "public read settings" on settings for select using (true);
create policy "admin write settings" on settings for all
  using (app_role() = 'admin') with check (app_role() = 'admin');

insert into settings (key, value) values ('delivery_fee', '{"amount": 30}');

-- ============================================================
-- BUSINESS LOGIC FUNCTIONS
-- ============================================================

-- Availability: on-hand minus reserved (open sales orders), computed live (never stored)
create or replace function get_available_qty(p_product_id uuid, p_variant_id uuid) returns integer
language sql stable as $$
  select coalesce((select sum(qty_remaining) from stock_lots
                    where product_id = p_product_id and variant_id is not distinct from p_variant_id), 0)
       - coalesce((select sum(soi.qty) from sales_order_items soi
                    join sales_orders so on so.id = soi.sales_order_id
                    where soi.product_id = p_product_id
                      and soi.variant_id is not distinct from p_variant_id
                      and so.status in ('new','confirmed')), 0);
$$;

-- Receive a purchase order: creates a stock lot per item and an inbound movement, marks PO received
create or replace function receive_purchase_order(p_purchase_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_item record;
  v_lot_id uuid;
begin
  if app_role() not in ('admin','staff') then
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

-- FIFO consumption helper: draws qty from oldest lots first, writes movements, returns total cost
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

-- Confirm a new order (also auto-generates its invoice)
create or replace function confirm_sales_order(p_sales_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if app_role() not in ('admin','staff') then
    raise exception 'not authorized';
  end if;

  update sales_orders set status = 'confirmed', confirmed_at = now(), updated_at = now()
    where id = p_sales_order_id and status = 'new';

  insert into invoices (sales_order_id)
    select p_sales_order_id where not exists (select 1 from invoices where sales_order_id = p_sales_order_id);
end; $$;

-- Cancel an order (no inventory reversal needed: nothing was deducted while reserved)
create or replace function cancel_sales_order(p_sales_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if app_role() not in ('admin','staff') then
    raise exception 'not authorized';
  end if;

  update sales_orders set status = 'cancelled', cancelled_at = now(), updated_at = now()
    where id = p_sales_order_id and status in ('new','confirmed');
end; $$;

-- Mark an order Done: deducts FIFO stock (expanding combos into components), computes COGS, posts ledger
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
    ('revenue', v_total_revenue + v_order.delivery_fee, 'Sale ' || v_order.order_number, 'sales_order', p_sales_order_id, auth.uid()),
    ('cogs', v_total_cogs, 'COGS for ' || v_order.order_number, 'sales_order', p_sales_order_id, auth.uid());
end; $$;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('request-attachments', 'request-attachments', false),
  ('payment-screenshots', 'payment-screenshots', false)
on conflict (id) do nothing;

create policy "public read product images" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "staff write product images" on storage.objects for all
  using (bucket_id = 'product-images' and app_role() in ('admin','staff'))
  with check (bucket_id = 'product-images' and app_role() in ('admin','staff'));

create policy "owner read request attachments" on storage.objects for select
  using (bucket_id = 'request-attachments' and
         (app_role() in ('admin','staff') or (storage.foldername(name))[1] = auth.uid()::text));
create policy "authenticated upload request attachments" on storage.objects for insert
  with check (bucket_id = 'request-attachments' and auth.role() = 'authenticated'
              and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owner read payment screenshots" on storage.objects for select
  using (bucket_id = 'payment-screenshots' and
         (app_role() in ('admin','staff') or (storage.foldername(name))[1] = auth.uid()::text));
create policy "authenticated upload payment screenshots" on storage.objects for insert
  with check (bucket_id = 'payment-screenshots' and auth.role() = 'authenticated'
              and (storage.foldername(name))[1] = auth.uid()::text);
