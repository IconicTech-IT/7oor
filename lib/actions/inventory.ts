"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adjustStockSchema, adjustStockZodSchema } from "@/lib/validators/inventory";
import { validateBoth } from "@/lib/validate";

export type ActionResult = { success?: boolean; error?: string };

export async function adjustStockAction(input: {
  productId: string;
  variantId: string | null;
  direction: "in" | "out";
  qty: number;
  reason: "adjustment" | "damaged";
  notes?: string;
}): Promise<ActionResult> {
  let data;
  try {
    data = await validateBoth(adjustStockSchema, adjustStockZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

  const supabase = await createClient();
  // p_variant_id is a nullable uuid at the SQL level — the generated RPC arg type doesn't
  // express that, but sending "" instead of null would fail uuid casting in Postgres.
  const args = {
    p_product_id: data.productId,
    p_variant_id: data.variantId ?? null,
    p_direction: data.direction,
    p_qty: data.qty,
    p_reason: data.reason,
    p_notes: data.notes ?? "",
  };
  const { error } = await supabase.rpc("adjust_stock", args as unknown as { p_product_id: string; p_variant_id: string; p_direction: string; p_qty: number; p_reason: string; p_notes: string });
  if (error) return { error: error.message };
  revalidatePath("/admin/inventory");
  return { success: true };
}
