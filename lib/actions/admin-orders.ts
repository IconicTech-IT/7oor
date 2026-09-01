"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/storage";
import { isUuid, validateBoth } from "@/lib/validate";
import { assertSection } from "@/lib/admin-permissions";
import {
  manualSaleSchema,
  manualSaleZodSchema,
  editOrderItemsSchema,
  editOrderItemsZodSchema,
  type ManualSaleValues,
  type EditOrderItemsValues,
} from "@/lib/validators/manual-sale";

export type ActionResult = { success?: boolean; error?: string; id?: string };

// The RPCs themselves re-check app_role() in ('admin','staff') server-side (see migration
// 0001/0002) — this action can't grant access the database wouldn't already grant.
export async function confirmOrderAction(orderId: string): Promise<ActionResult> {
  const sectionError = await assertSection("orders");
  if (sectionError) return { error: sectionError };

  if (!isUuid(orderId)) return { error: "Invalid order id" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_sales_order", { p_sales_order_id: orderId });
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidateTag("availability", "max");
  return { success: true };
}

export async function markOrderDoneAction(orderId: string): Promise<ActionResult> {
  const sectionError = await assertSection("orders");
  if (sectionError) return { error: sectionError };

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
  const sectionError = await assertSection("orders");
  if (sectionError) return { error: sectionError };

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
  const sectionError = await assertSection("orders");
  if (sectionError) return { error: sectionError };

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
      unit_price: i.unitPrice ?? null,
    })),
    p_payment_method: data.paymentMethod,
    p_discount: data.discount || 0,
    p_notes: data.notes || undefined,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/accounting");
  revalidateTag("availability", "max");
  return { success: true, id: orderId as string };
}

// update_sales_order_items() is SECURITY DEFINER and only allows editing while the order is
// still 'new'/'confirmed' — before mark_sales_order_done() has touched stock or accounting,
// so an edit here needs no ledger/inventory reversal; completion later posts the final items.
export async function updateOrderItemsAction(
  orderId: string,
  items: EditOrderItemsValues,
): Promise<ActionResult> {
  const sectionError = await assertSection("orders");
  if (sectionError) return { error: sectionError };

  if (!isUuid(orderId)) return { error: "Invalid order id" };
  let data;
  try {
    data = await validateBoth(editOrderItemsSchema, editOrderItemsZodSchema, items);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }
  const supabase = await createClient();

  const { error } = await supabase.rpc("update_sales_order_items", {
    p_sales_order_id: orderId,
    p_items: data.map((i) => ({
      product_id: i.productId,
      variant_id: i.variantId || null,
      qty: i.qty,
      unit_price: i.unitPrice ?? null,
    })),
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidateTag("availability", "max");
  return { success: true };
}
