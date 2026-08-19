"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/storage";
import { isUuid } from "@/lib/validate";

export type ActionResult = { success?: boolean; error?: string };

// The RPCs themselves re-check app_role() in ('admin','staff') server-side (see migration
// 0001/0002) — this action can't grant access the database wouldn't already grant.
export async function confirmOrderAction(orderId: string): Promise<ActionResult> {
  if (!isUuid(orderId)) return { error: "Invalid order id" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_sales_order", { p_sales_order_id: orderId });
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidateTag("availability", "max");
  return { success: true };
}

export async function markOrderDoneAction(orderId: string): Promise<ActionResult> {
  if (!isUuid(orderId)) return { error: "Invalid order id" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_sales_order_done", { p_sales_order_id: orderId });
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/accounting");
  revalidateTag("availability", "max");
  return { success: true };
}

export async function cancelOrderAction(orderId: string): Promise<ActionResult> {
  if (!isUuid(orderId)) return { error: "Invalid order id" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_sales_order", { p_sales_order_id: orderId });
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidateTag("availability", "max");
  return { success: true };
}

export async function getPaymentScreenshotUrlAction(path: string): Promise<string | null> {
  if (typeof path !== "string" || path.length === 0 || path.includes("..")) return null;
  return getSignedUrl(path, 60 * 60);
}
