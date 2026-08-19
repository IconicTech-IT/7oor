-- Follow-up to 0007: confirm_sales_order/cancel_sales_order/mark_sales_order_done/
-- receive_purchase_order were never targeted by ANY revoke in prior migrations —
-- Supabase's default-privileges setup grants EXECUTE to anon/authenticated directly
-- (not via PUBLIC) on function creation, so the "revoke ... from public" in 0007 was
-- a no-op for these four. All four are admin/staff-only (each already has an internal
-- app_role() check), matching adjust_stock/set_user_role which correctly already show
-- anon=false, authenticated=true.
revoke execute on function confirm_sales_order(uuid) from anon;
revoke execute on function cancel_sales_order(uuid) from anon;
revoke execute on function mark_sales_order_done(uuid) from anon;
revoke execute on function receive_purchase_order(uuid) from anon;
