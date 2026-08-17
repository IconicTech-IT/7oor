"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deliveryFeeSchema, deliveryFeeZodSchema } from "@/lib/validators/settings";
import { validateBoth } from "@/lib/validate";

export type ActionResult = { success?: boolean; error?: string };

export async function updateDeliveryFeeAction(amount: number): Promise<ActionResult> {
  let data;
  try {
    data = await validateBoth(deliveryFeeSchema, deliveryFeeZodSchema, { amount });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({ value: { amount: data.amount }, updated_at: new Date().toISOString() })
    .eq("key", "delivery_fee");
  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { success: true };
}
