"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadUserFile } from "@/lib/storage";

export type PlaceOrderResult = { orderId?: string; error?: string };

/**
 * Order creation never trusts client-submitted prices: only product/variant ids and
 * quantities are sent, and create_sales_order() (SECURITY DEFINER) looks up the
 * authoritative price from the catalog itself. See migration 0003 for why.
 */
export async function placeOrderAction(formData: FormData): Promise<PlaceOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to check out." };
  }

  let items: { productId: string; variantId: string | null; qty: number }[];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Invalid cart data" };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Your cart is empty" };
  }

  const fulfillmentMethod = String(formData.get("fulfillmentMethod") ?? "");
  const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "");

  // Empty string reads identically to "not provided" in create_sales_order's own
  // null-or-blank checks, so the RPC's required (non-nullable) text args stay satisfied.
  let screenshotPath = "";
  const screenshot = formData.get("screenshot");
  if (screenshot instanceof File && screenshot.size > 0) {
    try {
      screenshotPath = await uploadUserFile(supabase, "payment-screenshots", user.id, screenshot);
    } catch (err) {
      console.error("placeOrderAction upload:", err);
      return { error: "Failed to upload payment screenshot" };
    }
  }

  const { data: orderId, error } = await supabase.rpc("create_sales_order", {
    p_items: items.map((i) => ({ product_id: i.productId, variant_id: i.variantId, qty: i.qty })),
    p_fulfillment_method: fulfillmentMethod,
    p_delivery_address: deliveryAddress,
    p_payment_method: paymentMethod,
    p_payment_screenshot_path: screenshotPath,
  });

  if (error) {
    console.error("create_sales_order:", error.message);
    return { error: error.message };
  }

  return { orderId: orderId as string };
}
