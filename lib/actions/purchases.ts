"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  purchaseOrderSchema,
  purchaseOrderZodSchema,
  type PurchaseOrderValues,
} from "@/lib/validators/purchase";
import { validateBoth, isUuid } from "@/lib/validate";

export type ActionResult = { success?: boolean; error?: string; id?: string };

export async function createPurchaseOrderAction(input: PurchaseOrderValues): Promise<ActionResult> {
  let data;
  try {
    data = await validateBoth(purchaseOrderSchema, purchaseOrderZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }
  const supabase = await createClient();

  const { data: po, error: poError } = await supabase
    .from("purchase_orders")
    .insert({ supplier_id: data.supplierId, notes: data.notes || null, status: "draft" })
    .select("id")
    .single();
  if (poError) return { error: poError.message };

  const { error: itemsError } = await supabase.from("purchase_order_items").insert(
    data.items.map((item) => ({
      purchase_order_id: po.id,
      product_id: item.productId,
      variant_id: item.variantId || null,
      qty_ordered: item.qtyOrdered,
      unit_cost: item.unitCost,
    })),
  );
  if (itemsError) return { error: itemsError.message };

  revalidatePath("/admin/purchases");
  return { success: true, id: po.id };
}

export async function markPurchaseOrderedAction(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return { error: "Invalid purchase order id" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("purchase_orders")
    .update({ status: "ordered", ordered_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "draft");
  if (error) return { error: error.message };
  revalidatePath(`/admin/purchases/${id}`);
  return { success: true };
}

// receive_purchase_order() is SECURITY DEFINER — it creates the stock_lots and
// inventory_movements rows staff have no direct insert access to, keeping FIFO cost
// basis tied to what was actually receipted.
export async function receivePurchaseOrderAction(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return { error: "Invalid purchase order id" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("receive_purchase_order", { p_purchase_order_id: id });
  if (error) return { error: error.message };
  revalidatePath(`/admin/purchases/${id}`);
  revalidatePath("/admin/inventory");
  revalidateTag("availability", "max");
  return { success: true };
}
