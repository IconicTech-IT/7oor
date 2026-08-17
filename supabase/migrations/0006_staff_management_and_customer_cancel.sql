-- Round 3: two new SECURITY DEFINER RPCs for admin-only staff management and
-- customer-initiated order cancellation, following the same pattern as every
-- other privileged mutation in this project (RLS is row-level only, so the
-- real authorization boundary is the check inside the function body).

-- 1) set_user_role: replaces the "run raw SQL to promote an account" bootstrap
--    step for every account after the first. Admin-only; rejects self-role-change
--    so an admin can't accidentally lock themselves out.
create or replace function set_user_role(p_target_user_id uuid, p_new_role text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(app_role(), '') <> 'admin' then
    raise exception 'not authorized';
  end if;

  if p_new_role not in ('customer', 'staff', 'admin') then
    raise exception 'invalid role';
  end if;

  if p_target_user_id = auth.uid() then
    raise exception 'cannot change your own role';
  end if;

  if not exists (select 1 from profiles where id = p_target_user_id) then
    raise exception 'user not found';
  end if;

  update profiles set role = p_new_role where id = p_target_user_id;
end; $$;

revoke execute on function set_user_role(uuid, text) from anon;

-- 2) cancel_own_sales_order: lets a customer cancel their own order while it's
--    still 'new' (not yet confirmed by staff). Narrower than cancel_sales_order()
--    (admin/staff, broader status range) — ownership-checked, not role-checked.
create or replace function cancel_own_sales_order(p_sales_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid := auth.uid();
begin
  if v_customer_id is null then
    raise exception 'must be authenticated';
  end if;

  update sales_orders set status = 'cancelled', cancelled_at = now(), updated_at = now()
    where id = p_sales_order_id and customer_id = v_customer_id and status = 'new';

  if not found then
    raise exception 'order cannot be cancelled';
  end if;
end; $$;

revoke execute on function cancel_own_sales_order(uuid) from anon;
