import * as yup from "yup";
import { z } from "zod";

export const manualSaleItemSchema = yup.object({
  productId: yup.string().required(),
  variantId: yup.string().optional(),
  qty: yup.number().integer().min(1).max(1000).required(),
  unitPrice: yup.number().min(0).optional(),
});

export const manualSaleSchema = yup.object({
  paymentMethod: yup.string().oneOf(["cash", "instapay", "vodafone_cash", "other_wallet"]).required(),
  discount: yup.number().min(0).optional(),
  notes: yup.string().trim().max(500).optional(),
  items: yup.array().of(manualSaleItemSchema).min(1, "Add at least one item").required(),
});

export type ManualSaleValues = yup.InferType<typeof manualSaleSchema>;

export const manualSaleItemZodSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  qty: z.number().int().min(1).max(1000),
  unitPrice: z.number().min(0).optional(),
});

export const manualSaleZodSchema = z.object({
  paymentMethod: z.enum(["cash", "instapay", "vodafone_cash", "other_wallet"]),
  discount: z.number().min(0).optional(),
  notes: z.string().trim().max(500).optional(),
  items: z.array(manualSaleItemZodSchema).min(1, "Add at least one item"),
});

export const editOrderItemSchema = yup.object({
  productId: yup.string().required(),
  variantId: yup.string().optional(),
  qty: yup.number().integer().min(1).max(1000).required(),
  unitPrice: yup.number().min(0).optional(),
});

export const editOrderItemsSchema = yup
  .array()
  .of(editOrderItemSchema)
  .min(1, "Add at least one item")
  .required();

export type EditOrderItemsValues = yup.InferType<typeof editOrderItemsSchema>;

export const editOrderItemZodSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  qty: z.number().int().min(1).max(1000),
  unitPrice: z.number().min(0).optional(),
});

export const editOrderItemsZodSchema = z.array(editOrderItemZodSchema).min(1, "Add at least one item");
