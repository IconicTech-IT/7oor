import * as yup from "yup";
import { z } from "zod";

export const checkoutSchema = yup.object({
  fulfillmentMethod: yup.string().oneOf(["pickup", "delivery"]).required(),
  deliveryAddress: yup
    .string()
    .trim()
    .max(300)
    .when("fulfillmentMethod", {
      is: "delivery",
      then: (schema) => schema.min(5).required(),
      otherwise: (schema) => schema.optional(),
    }),
  paymentMethod: yup
    .string()
    .oneOf(["cash", "instapay", "vodafone_cash", "other_wallet"])
    .required(),
});

export type CheckoutValues = yup.InferType<typeof checkoutSchema>;

export const fulfillmentStepFields = ["fulfillmentMethod", "deliveryAddress"] as const;
export const paymentStepFields = ["paymentMethod"] as const;

export const checkoutZodSchema = z
  .object({
    fulfillmentMethod: z.enum(["pickup", "delivery"]),
    deliveryAddress: z.string().trim().max(300).optional(),
    paymentMethod: z.enum(["cash", "instapay", "vodafone_cash", "other_wallet"]),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillmentMethod === "delivery" && (!data.deliveryAddress || data.deliveryAddress.length < 5)) {
      ctx.addIssue({ code: "custom", path: ["deliveryAddress"], message: "Delivery address is required" });
    }
  });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const checkoutItemSchema = yup.object({
  productId: yup.string().matches(UUID_RE, "Invalid product id").required(),
  variantId: yup.string().matches(UUID_RE, "Invalid variant id").nullable().optional(),
  qty: yup.number().integer().min(1).max(1000).required(),
});

export const checkoutItemsSchema = yup.array().of(checkoutItemSchema).min(1).required();

export const checkoutItemZodSchema = z.object({
  productId: z.string().regex(UUID_RE, "Invalid product id"),
  variantId: z.string().regex(UUID_RE, "Invalid variant id").nullable().optional(),
  qty: z.number().int().min(1).max(1000),
});

export const checkoutItemsZodSchema = z.array(checkoutItemZodSchema).min(1);
