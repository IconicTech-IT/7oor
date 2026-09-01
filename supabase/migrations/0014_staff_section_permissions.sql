-- Per-staff section permissions. Admins are always full-access and untouched by this table —
-- it only narrows what a 'staff' role account can reach among the sections staff can normally
-- see at all (products, categories, orders, requests, inventory, purchases, suppliers).
-- Accounting/staff-management/storage/settings stay admin-only, unchanged from before.
create table staff_permissions (
  user_id uuid primary key references profiles(id) on delete cascade,
  sections text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table staff_permissions enable row level security;

create policy "self or admin read" on staff_permissions for select
  using (auth.uid() = user_id or app_role() = 'admin');
create policy "admin write" on staff_permissions for all
  using (app_role() = 'admin') with check (app_role() = 'admin');

create or replace function set_staff_sections(p_target_user_id uuid, p_sections text[]) returns void
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(app_role(), '') <> 'admin' then
    raise exception 'not authorized';
  end if;

  if exists (
    select 1 from unnest(p_sections) s
    where s not in ('products','categories','orders','requests','inventory','purchases','suppliers')
  ) then
    raise exception 'invalid section';
  end if;

  insert into staff_permissions (user_id, sections, updated_at)
  values (p_target_user_id, p_sections, now())
  on conflict (user_id) do update set sections = excluded.sections, updated_at = now();
end; $$;

revoke execute on function set_staff_sections(uuid, text[]) from anon;
