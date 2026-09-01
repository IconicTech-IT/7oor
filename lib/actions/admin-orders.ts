"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/storage";
import { isUuid, validateBoth } from "@/lib/validate";
import {
  manualSaleSchema,
  manualSaleZodSchema,
  type ManualSaleValues,
} from "@/lib/validators/manual-sale";

export type ActionResult = { success?: boolean; error?: string; id?: string };

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

// create_manual_sale() is SECURITY DEFINER: it prices from the catalog (never trusts
// client prices) and immediately completes the sale via mark_sales_order_done(), so a
// walk-in sale deducts stock and posts to the accounting ledger the same as checkout does.
export async function createManualSaleAction(input: ManualSaleValues): Promise<ActionResult> {
  let data;
  try {
    data = await validateBoth(manualSaleSchema, manualSaleZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }
  const supabase = await createClient();

  const { data: orderId, error } = await supabase.rpc("create_manual_sale", {
    p_items: data.items.map((i) => ({
      product_id: i.productId,
      variant_id: i.variantId || null,
      qty: i.qty,
    })),
    p_payment_method: data.paymentMethod,
    p_notes: data.notes || undefined,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/accounting");
  revalidateTag("availability", "max");
  return { success: true, id: orderId as string };
}
