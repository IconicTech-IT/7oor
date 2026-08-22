"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  purchaseReturnSchema,
  purchaseReturnZodSchema,
  salesReturnSchema,
  salesReturnZodSchema,
  type PurchaseReturnValues,
  type SalesReturnValues,
} from "@/lib/validators/returns";
import { validateBoth } from "@/lib/validate";

export type ActionResult = { success?: boolean; error?: string; id?: string };

// create_purchase_return()/create_sales_return() are SECURITY DEFINER — they touch
// stock_lots/inventory_movements/ledger_entries, none of which staff can write to
// directly (see 0010 migration). This action is a second line of defense on input
// shape only; the RPCs re-check role, order/PO status, and returnable quantities
// themselves, matching every other financially-sensitive mutation in this project.
export async function createPurchaseReturnAction(input: PurchaseReturnValues): Promise<ActionResult> {
  let data;
  try {
    data = await validateBoth(purchaseReturnSchema, purchaseReturnZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

  const supabase = await createClient();
  const { data: returnId, error } = await supabase.rpc("create_purchase_return", {
    p_purchase_order_id: data.purchaseOrderId,
    p_items: data.items.map((item) => ({
      purchase_order_item_id: item.purchaseOrderItemId,
      qty: item.qty,
    })),
    p_reason: data.reason ?? "",
    p_notes: data.notes ?? "",
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/purchases/${data.purchaseOrderId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/accounting");
  revalidateTag("availability", "max");
  return { success: true, id: returnId as unknown as string };
}

export async function createSalesReturnAction(input: SalesReturnValues): Promise<ActionResult> {
  let data;
  try {
    data = await validateBoth(salesReturnSchema, salesReturnZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

  const supabase = await createClient();
  const { data: returnId, error } = await supabase.rpc("create_sales_return", {
    p_sales_order_id: data.salesOrderId,
    p_items: data.items.map((item) => ({
      sales_order_item_id: item.salesOrderItemId,
      qty: item.qty,
      restock: item.restock ?? true,
    })),
    p_reason: data.reason ?? "",
    p_notes: data.notes ?? "",
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${data.salesOrderId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/accounting");
  revalidateTag("availability", "max");
  return { success: true, id: returnId as unknown as string };
}
