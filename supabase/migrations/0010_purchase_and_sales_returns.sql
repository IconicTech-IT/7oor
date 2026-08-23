-- Returns:
--   1) Purchase returns (مرتجع مشتريات) — store returns received stock back to a supplier.
--      Tied to a specific received Purchase Order; deducts from that PO's own stock_lots
--      (each purchase_order_item created exactly one lot on receipt, so this stays FIFO-
--      correct without touching any other lot), and credits back part of the expense
--      that was posted when the PO was received.
--   2) Sales returns (مرتجع مبيعات) — a customer returns product from a completed order.
--      Only allowed once the order is 'done' (i.e. FIFO/COGS already posted). Each line can
--      be marked "restock" (goes back into sellable stock at its original per-unit cost —
--      new stock_lot) or not (damaged/unsellable — no stock added back). Reverses revenue
--      by the refunded amount, and reverses COGS only for the restocked portion (the cost
--      basis of a damaged, non-restocked item was already correctly recognized and stays).
--
-- Both follow this codebase's established pattern: RLS lets staff/admin only SELECT these
-- tables — all writes (which touch stock_lots/ledger_entries, both defense-in-depth locked
-- to SECURITY DEFINER functions only) go through create_purchase_return()/create_sales_return(),
-- which re-check the caller's role internally, exactly like create_sales_order() etc.

alter table purchase_order_items
  add column if not exists qty_returned integer not null default 0
    check (qty_returned >= 0 and qty_returned <= qty_ordered);

alter table sales_order_items
  add column if not exists qty_returned integer not null default 0
    check (qty_returned >= 0 and qty_returned <= qty);

-- Widen ledger_entries.type / source_type to admit the new entry kinds, without relying on
-- guessing Postgres's auto-generated constraint names (safe regardless of what they are).
do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
    where rel.relname = 'ledger_entries' and con.contype = 'c' and att.attname = 'type'
  loop
    execute format('alter table ledger_entries drop constraint %I', r.conname);
  end loop;
end $$;

alter table ledger_entries add constraint ledger_entries_type_check
  check (type in ('revenue','cogs','expense','payment_received','payment_made','purchase_return','sales_return','cogs_reversal'));

do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
    where rel.relname = 'ledger_entries' and con.contype = 'c' and att.attname = 'source_type'
  loop
    execute format('alter table ledger_entries drop constraint %I', r.conname);
  end loop;
end $$;

alter table ledger_entries add constraint ledger_entries_source_type_check
  check (source_type in ('sales_order','purchase_order','invoice','bill','manual','purchase_return','sales_return'));

-- ============================================================
-- PURCHASE RETURNS
-- ============================================================
create sequence purchase_return_seq;
create table purchase_returns (
  id uuid primary key default gen_random_uuid(),
  return_number text not null unique default ('PR-' || lpad(nextval('purchase_return_seq')::text, 6, '0')),
  purchase_order_id uuid not null references purchase_orders(id),
  reason text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_pr_po on purchase_returns(purchase_order_id);

alter table purchase_returns enable row level security;
create policy "staff read purchase returns" on purchase_returns for select
  using (app_role() in ('admin','staff'));
-- no insert/update/delete policy — only create_purchase_return() (SECURITY DEFINER) writes here.

create table purchase_return_items (
  id uuid primary key default gen_random_uuid(),
  purchase_return_id uuid not null references purchase_returns(id) on delete cascade,
  purchase_order_item_id uuid not null references purchase_order_items(id),
  product_id uuid not null references products(id),
  variant_id uuid references product_variants(id),
  qty integer not null check (qty > 0),
  unit_cost numeric(12,2) not null,
  line_total numeric(12,2) not null,
  created_at timestamptz not null default now()
);
create index idx_pri_return on purchase_return_items(purchase_return_id);

alter table purchase_return_items enable row level security;
create policy "staff read purchase return items" on purchase_return_items for select
  using (app_role() in ('admin','staff'));

create or replace function create_purchase_return(
  p_purchase_order_id uuid,
  p_items jsonb,
  p_reason text,
  p_notes text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_po purchase_orders%rowtype;
  v_item jsonb;
  v_poi purchase_order_items%rowtype;
  v_lot stock_lots%rowtype;
  v_qty integer;
  v_return_id uuid;
  v_line_total numeric;
  v_total_cost numeric := 0;
  v_item_count integer := 0;
begin
  if coalesce(app_role(), '') not in ('admin','staff') then
    raise exception 'not authorized';
  end if;

  select * into v_po from purchase_orders where id = p_purchase_order_id;
  if not found or v_po.status <> 'received' then
    raise exception 'purchase order must be received before it can be returned';
  end if;

  insert into purchase_returns (purchase_order_id, reason, notes, created_by)
  values (p_purchase_order_id, p_reason, p_notes, auth.uid())
  returning id into v_return_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_item_count := v_item_count + 1;

    select * into v_poi from purchase_order_items
      where id = (v_item->>'purchase_order_item_id')::uuid and purchase_order_id = p_purchase_order_id;
    if not found then
      raise exception 'purchase order item not found';
    end if;

    v_qty := (v_item->>'qty')::integer;
    if v_qty is null or v_qty <= 0 then
      raise exception 'invalid quantity';
    end if;
    if v_qty > (v_poi.qty_ordered - v_poi.qty_returned) then
      raise exception 'cannot return more than was purchased and not yet returned';
    end if;

    -- Each purchase_order_item created exactly one lot on receipt (receive_purchase_order).
    select * into v_lot from stock_lots where purchase_order_item_id = v_poi.id for update;
    if not found or v_lot.qty_remaining < v_qty then
      raise exception 'insufficient remaining stock to return (already sold or partially returned)';
    end if;

    update stock_lots set qty_remaining = qty_remaining - v_qty where id = v_lot.id;
    update purchase_order_items set qty_returned = qty_returned + v_qty where id = v_poi.id;

    insert into inventory_movements
      (product_id, variant_id, stock_lot_id, direction, qty, reason, unit_cost, source_type, source_id, created_by)
    values
      (v_poi.product_id, v_poi.variant_id, v_lot.id, 'out', v_qty, 'return', v_lot.unit_cost,
       'purchase_order_item', v_poi.id, auth.uid());

    v_line_total := v_qty * v_lot.unit_cost;
    v_total_cost := v_total_cost + v_line_total;

    insert into purchase_return_items
      (purchase_return_id, purchase_order_item_id, product_id, variant_id, qty, unit_cost, line_total)
    values
      (v_return_id, v_poi.id, v_poi.product_id, v_poi.variant_id, v_qty, v_lot.unit_cost, v_line_total);
  end loop;

  if v_item_count = 0 then
    raise exception 'a return must have at least one item';
  end if;

  if v_total_cost > 0 then
    insert into ledger_entries (type, amount, description, source_type, source_id, created_by)
    values ('purchase_return', v_total_cost, 'Return for ' || v_po.po_number, 'purchase_return', v_return_id, auth.uid());
  end if;

  return v_return_id;
end; $$;

-- BOTH revokes are required. Postgres grants EXECUTE to PUBLIC by default, and Supabase's
-- ALTER DEFAULT PRIVILEGES additionally grants EXECUTE to anon explicitly on new public-schema
-- functions — so revoking only one of them leaves the other in place (verified against
-- pg_proc.proacl after apply). End state matches every other write RPC in this schema:
-- postgres | authenticated | service_role.
revoke execute on function create_purchase_return(uuid, jsonb, text, text) from public;
revoke execute on function create_purchase_return(uuid, jsonb, text, text) from anon;
grant execute on function create_purchase_return(uuid, jsonb, text, text) to authenticated;

-- ============================================================
-- SALES RETURNS
-- ============================================================
create sequence sales_return_seq;
create table sales_returns (
  id uuid primary key default gen_random_uuid(),
  return_number text not null unique default ('SR-' || lpad(nextval('sales_return_seq')::text, 6, '0')),
  sales_order_id uuid not null references sales_orders(id),
  reason text,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_sr_so on sales_returns(sales_order_id);

alter table sales_returns enable row level security;
create policy "staff read sales returns" on sales_returns for select
  using (app_role() in ('admin','staff'));
create policy "customer read own sales returns" on sales_returns for select
  using (exists (select 1 from sales_orders so where so.id = sales_order_id and so.customer_id = auth.uid()));
-- no insert/update/delete policy — only create_sales_return() (SECURITY DEFINER) writes here.

create table sales_return_items (
  id uuid primary key default gen_random_uuid(),
  sales_return_id uuid not null references sales_returns(id) on delete cascade,
  sales_order_item_id uuid not null references sales_order_items(id),
  product_id uuid not null references products(id),
  variant_id uuid references product_variants(id),
  qty integer not null check (qty > 0),
  unit_price numeric(12,2) not null,
  unit_cost numeric(12,2) not null,
  restocked boolean not null default true,
  line_total numeric(12,2) not null,
  created_at timestamptz not null default now()
);
create index idx_sri_return on sales_return_items(sales_return_id);

alter table sales_return_items enable row level security;
create policy "staff read sales return items" on sales_return_items for select
  using (app_role() in ('admin','staff'));
create policy "customer read own sales return items" on sales_return_items for select
  using (exists (
    select 1 from sales_returns sr join sales_orders so on so.id = sr.sales_order_id
    where sr.id = sales_return_id and so.customer_id = auth.uid()
  ));

create or replace function create_sales_return(
  p_sales_order_id uuid,
  p_items jsonb,
  p_reason text,
  p_notes text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_so sales_orders%rowtype;
  v_item jsonb;
  v_soi sales_order_items%rowtype;
  v_qty integer;
  v_restock boolean;
  v_unit_cost numeric;
  v_lot_id uuid;
  v_return_id uuid;
  v_line_total numeric;
  v_line_cost numeric;
  v_refund_total numeric := 0;
  v_cogs_reversal_total numeric := 0;
  v_item_count integer := 0;
begin
  if coalesce(app_role(), '') not in ('admin','staff') then
    raise exception 'not authorized';
  end if;

  select * into v_so from sales_orders where id = p_sales_order_id;
  if not found or v_so.status <> 'done' then
    raise exception 'order must be done before it can be returned';
  end if;

  insert into sales_returns (sales_order_id, reason, notes, created_by)
  values (p_sales_order_id, p_reason, p_notes, auth.uid())
  returning id into v_return_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_item_count := v_item_count + 1;

    select * into v_soi from sales_order_items
      where id = (v_item->>'sales_order_item_id')::uuid and sales_order_id = p_sales_order_id
      for update;
    if not found then
      raise exception 'sales order item not found';
    end if;

    v_qty := (v_item->>'qty')::integer;
    if v_qty is null or v_qty <= 0 then
      raise exception 'invalid quantity';
    end if;
    if v_qty > (v_soi.qty - v_soi.qty_returned) then
      raise exception 'cannot return more than was sold and not yet returned';
    end if;

    v_restock := coalesce((v_item->>'restock')::boolean, true);
    v_unit_cost := coalesce(v_soi.cogs_total, 0) / v_soi.qty;

    update sales_order_items set qty_returned = qty_returned + v_qty where id = v_soi.id;

    if v_restock then
      insert into stock_lots (product_id, variant_id, qty_received, qty_remaining, unit_cost)
      values (v_soi.product_id, v_soi.variant_id, v_qty, v_qty, v_unit_cost)
      returning id into v_lot_id;

      insert into inventory_movements
        (product_id, variant_id, stock_lot_id, direction, qty, reason, unit_cost, source_type, source_id, created_by)
      values
        (v_soi.product_id, v_soi.variant_id, v_lot_id, 'in', v_qty, 'return', v_unit_cost,
         'sales_order_item', v_soi.id, auth.uid());

      v_line_cost := v_qty * v_unit_cost;
      v_cogs_reversal_total := v_cogs_reversal_total + v_line_cost;
    end if;

    v_line_total := v_qty * v_soi.unit_price;
    v_refund_total := v_refund_total + v_line_total;

    insert into sales_return_items
      (sales_return_id, sales_order_item_id, product_id, variant_id, qty, unit_price, unit_cost, restocked, line_total)
    values
      (v_return_id, v_soi.id, v_soi.product_id, v_soi.variant_id, v_qty, v_soi.unit_price, v_unit_cost, v_restock, v_line_total);
  end loop;

  if v_item_count = 0 then
    raise exception 'a return must have at least one item';
  end if;

  if v_refund_total > 0 then
    insert into ledger_entries (type, amount, description, source_type, source_id, created_by)
    values ('sales_return', v_refund_total, 'Return for ' || v_so.order_number, 'sales_return', v_return_id, auth.uid());
  end if;
  if v_cogs_reversal_total > 0 then
    insert into ledger_entries (type, amount, description, source_type, source_id, created_by)
    values ('cogs_reversal', v_cogs_reversal_total, 'Restocked return for ' || v_so.order_number, 'sales_return', v_return_id, auth.uid());
  end if;

  return v_return_id;
end; $$;

-- Same both-revokes reasoning as create_purchase_return above.
revoke execute on function create_sales_return(uuid, jsonb, text, text) from public;
revoke execute on function create_sales_return(uuid, jsonb, text, text) from anon;
grant execute on function create_sales_return(uuid, jsonb, text, text) to authenticated;
