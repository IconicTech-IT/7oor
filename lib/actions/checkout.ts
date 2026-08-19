"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadUserFile } from "@/lib/storage";
import {
  checkoutSchema,
  checkoutZodSchema,
  checkoutItemsSchema,
  checkoutItemsZodSchema,
} from "@/lib/validators/checkout";
import { validateBoth } from "@/lib/validate";

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

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Invalid cart data" };
  }

  let items;
  let fields;
  try {
    items = await validateBoth(checkoutItemsSchema, checkoutItemsZodSchema, rawItems);
    fields = await validateBoth(checkoutSchema, checkoutZodSchema, {
      fulfillmentMethod: formData.get("fulfillmentMethod"),
      deliveryAddress: formData.get("deliveryAddress") || undefined,
      paymentMethod: formData.get("paymentMethod"),
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid checkout data" };
  }

  // Empty string reads identically to "not provided" in create_sales_order's own
  // null-or-blank checks, so the RPC's required (non-nullable) text args stay satisfied.
  let screenshotPath = "";
  const screenshot = formData.get("screenshot");
  if (screenshot instanceof File && screenshot.size > 0) {
    try {
      screenshotPath = await uploadUserFile("payment-screenshots", user.id, screenshot);
    } catch (err) {
      console.error("placeOrderAction upload:", err);
      return { error: "Failed to upload payment screenshot" };
    }
  }

  const { data: orderId, error } = await supabase.rpc("create_sales_order", {
    p_items: items.map((i) => ({ product_id: i.productId, variant_id: i.variantId ?? null, qty: i.qty })),
    p_fulfillment_method: fields.fulfillmentMethod,
    p_delivery_address: fields.deliveryAddress ?? "",
    p_payment_method: fields.paymentMethod,
    p_payment_screenshot_path: screenshotPath,
  });

  if (error) {
    console.error("create_sales_order:", error.message);
    return { error: error.message };
  }

  revalidateTag("availability", "max");
  return { orderId: orderId as string };
}
