import * as yup from "yup";

export const variantInputSchema = yup.object({
  id: yup.string().optional(),
  nameAr: yup.string().trim().min(1).required(),
  nameEn: yup.string().trim().min(1).required(),
  sku: yup.string().trim().optional(),
  colorHex: yup.string().trim().optional(),
  price: yup
    .number()
    .transform((v, orig) => (orig === "" ? undefined : v))
    .min(0)
    .optional(),
  imageUrl: yup.string().optional(),
});

export const comboComponentInputSchema = yup.object({
  componentProductId: yup.string().required(),
  componentVariantId: yup.string().optional(),
  qty: yup.number().min(1).required(),
});

export const productSchema = yup.object({
  type: yup.string().oneOf(["simple", "combo", "custom_request"]).required(),
  pricingUnit: yup.string().oneOf(["item", "page", "job"]).required(),
  nameAr: yup.string().trim().min(1).max(150).required(),
  nameEn: yup.string().trim().min(1).max(150).required(),
  slug: yup
    .string()
    .trim()
    .lowercase()
    .matches(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only")
    .required(),
  categoryId: yup.string().optional(),
  shortDescriptionAr: yup.string().trim().max(300).optional(),
  shortDescriptionEn: yup.string().trim().max(300).optional(),
  descriptionAr: yup.string().trim().max(4000).optional(),
  descriptionEn: yup.string().trim().max(4000).optional(),
  price: yup
    .number()
    .transform((v, orig) => (orig === "" ? 0 : v))
    .min(0)
    .required(),
  imageUrl: yup.string().optional(),
  isActive: yup.boolean().default(true),
  lowStockThreshold: yup
    .number()
    .transform((v, orig) => (orig === "" ? 5 : v))
    .min(0)
    .default(5),
  comboForceAvailable: yup.boolean().default(false),
  variants: yup.array().of(variantInputSchema).default([]),
  comboComponents: yup.array().of(comboComponentInputSchema).default([]),
});

export type ProductFormValues = yup.InferType<typeof productSchema>;
