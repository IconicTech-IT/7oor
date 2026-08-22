import * as yup from "yup";
import { z } from "zod";

const purchaseReturnItemSchema = yup.object({
  purchaseOrderItemId: yup.string().trim().uuid().required(),
  qty: yup.number().min(1).required(),
});

export const purchaseReturnSchema = yup.object({
  purchaseOrderId: yup.string().trim().uuid().required(),
  reason: yup.string().trim().max(300).optional(),
  notes: yup.string().trim().max(500).optional(),
  items: yup.array().of(purchaseReturnItemSchema).min(1, "Add at least one item").required(),
});

export type PurchaseReturnValues = yup.InferType<typeof purchaseReturnSchema>;

const purchaseReturnItemZodSchema = z.object({
  purchaseOrderItemId: z.string().trim().uuid(),
  qty: z.number().min(1),
});

export const purchaseReturnZodSchema = z.object({
  purchaseOrderId: z.string().trim().uuid(),
  reason: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(500).optional(),
  items: z.array(purchaseReturnItemZodSchema).min(1, "Add at least one item"),
});

const salesReturnItemSchema = yup.object({
  salesOrderItemId: yup.string().trim().uuid().required(),
  qty: yup.number().min(1).required(),
  restock: yup.boolean().default(true),
});

export const salesReturnSchema = yup.object({
  salesOrderId: yup.string().trim().uuid().required(),
  reason: yup.string().trim().max(300).optional(),
  notes: yup.string().trim().max(500).optional(),
  items: yup.array().of(salesReturnItemSchema).min(1, "Add at least one item").required(),
});

export type SalesReturnValues = yup.InferType<typeof salesReturnSchema>;

const salesReturnItemZodSchema = z.object({
  salesOrderItemId: z.string().trim().uuid(),
  qty: z.number().min(1),
  restock: z.boolean().default(true),
});

export const salesReturnZodSchema = z.object({
  salesOrderId: z.string().trim().uuid(),
  reason: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(500).optional(),
  items: z.array(salesReturnItemZodSchema).min(1, "Add at least one item"),
});
