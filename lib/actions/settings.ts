"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { success?: boolean; error?: string };

export async function updateDeliveryFeeAction(amount: number): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({ value: { amount }, updated_at: new Date().toISOString() })
    .eq("key", "delivery_fee");
  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { success: true };
}
