"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  deliveryFeeSchema,
  deliveryFeeZodSchema,
  paymentInfoSchema,
  paymentInfoZodSchema,
  type PaymentInfoValues,
} from "@/lib/validators/settings";
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
  revalidateTag("settings", "max");
  return { success: true };
}

export async function updatePaymentInfoAction(input: PaymentInfoValues): Promise<ActionResult> {
  let data;
  try {
    data = await validateBoth(paymentInfoSchema, paymentInfoZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({
      value: {
        instapay: data.instapay ?? "",
        vodafone_cash: data.vodafoneCash ?? "",
        other_wallet_note: data.otherWalletNote ?? "",
      },
      updated_at: new Date().toISOString(),
    })
    .eq("key", "payment_info");
  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  revalidateTag("settings", "max");
  return { success: true };
}
