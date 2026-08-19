"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validate";

export type CancelOrderResult = { success?: boolean; error?: string };

export async function cancelOwnOrderAction(orderId: string): Promise<CancelOrderResult> {
  if (!isUuid(orderId)) return { error: "Invalid order id" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_own_sales_order", {
    p_sales_order_id: orderId,
  });

  if (error) return { error: error.message };
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidateTag("availability", "max");
  return { success: true };
}
