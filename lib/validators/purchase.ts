import * as yup from "yup";
import { z } from "zod";

export const supplierSchema = yup.object({
  name: yup.string().trim().min(1).max(150).required(),
  phone: yup.string().trim().max(30).optional(),
  email: yup
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .email()
    .optional(),
  address: yup.string().trim().max(300).optional(),
});

export type SupplierValues = yup.InferType<typeof supplierSchema>;

export const supplierZodSchema = z.object({
  name: z.string().trim().min(1).max(150),
  phone: z.string().trim().max(30).optional(),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
  address: z.string().trim().max(300).optional(),
});

export const purchaseOrderItemSchema = yup.object({
  productId: yup.string().required(),
  variantId: yup.string().optional(),
  qtyOrdered: yup.number().min(1).required(),
  unitCost: yup.number().min(0).required(),
});

export const purchaseOrderSchema = yup.object({
  supplierId: yup.string().required(),
  notes: yup.string().trim().max(500).optional(),
  items: yup.array().of(purchaseOrderItemSchema).min(1, "Add at least one item").required(),
});

export type PurchaseOrderValues = yup.InferType<typeof purchaseOrderSchema>;

export const purchaseOrderItemZodSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  qtyOrdered: z.number().min(1),
  unitCost: z.number().min(0),
});

export const purchaseOrderZodSchema = z.object({
  supplierId: z.string().min(1),
  notes: z.string().trim().max(500).optional(),
  items: z.array(purchaseOrderItemZodSchema).min(1, "Add at least one item"),
});
