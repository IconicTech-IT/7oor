import * as yup from "yup";
import { z } from "zod";

export const adjustStockSchema = yup.object({
  productId: yup.string().required(),
  variantId: yup.string().nullable().optional(),
  direction: yup.string().oneOf(["in", "out"]).required(),
  qty: yup.number().integer().min(1).max(100000).required(),
  reason: yup.string().oneOf(["adjustment", "damaged"]).required(),
  notes: yup.string().trim().max(500).optional(),
});

export type AdjustStockValues = yup.InferType<typeof adjustStockSchema>;

export const adjustStockZodSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  direction: z.enum(["in", "out"]),
  qty: z.number().int().min(1).max(100000),
  reason: z.enum(["adjustment", "damaged"]),
  notes: z.string().trim().max(500).optional(),
});
