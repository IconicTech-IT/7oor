import * as yup from "yup";
import { z } from "zod";

export const manualSaleItemSchema = yup.object({
  productId: yup.string().required(),
  variantId: yup.string().optional(),
  qty: yup.number().integer().min(1).max(1000).required(),
});

export const manualSaleSchema = yup.object({
  paymentMethod: yup.string().oneOf(["cash", "instapay", "vodafone_cash", "other_wallet"]).required(),
  notes: yup.string().trim().max(500).optional(),
  items: yup.array().of(manualSaleItemSchema).min(1, "Add at least one item").required(),
});

export type ManualSaleValues = yup.InferType<typeof manualSaleSchema>;

export const manualSaleItemZodSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  qty: z.number().int().min(1).max(1000),
});

export const manualSaleZodSchema = z.object({
  paymentMethod: z.enum(["cash", "instapay", "vodafone_cash", "other_wallet"]),
  notes: z.string().trim().max(500).optional(),
  items: z.array(manualSaleItemZodSchema).min(1, "Add at least one item"),
});
