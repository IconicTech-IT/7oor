import * as yup from "yup";

export const supplierSchema = yup.object({
  name: yup.string().trim().min(1).max(150).required(),
  phone: yup.string().trim().max(30).optional(),
  email: yup.string().trim().email().optional(),
  address: yup.string().trim().max(300).optional(),
});

export type SupplierValues = yup.InferType<typeof supplierSchema>;

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
