import * as yup from "yup";
import { z } from "zod";

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

const zNumOrBlank = (fallback: number) =>
  z.preprocess((v) => (v === "" || v === undefined || v === null ? fallback : v), z.number().min(0));

export const variantInputZodSchema = z.object({
  id: z.string().optional(),
  nameAr: z.string().trim().min(1),
  nameEn: z.string().trim().min(1),
  sku: z.string().trim().optional(),
  colorHex: z.string().trim().optional(),
  price: z.preprocess((v) => (v === "" ? undefined : v), z.number().min(0).optional()),
  imageUrl: z.string().optional(),
});

export const comboComponentInputZodSchema = z.object({
  componentProductId: z.string().min(1),
  componentVariantId: z.string().optional(),
  qty: z.number().min(1),
});

export const productZodSchema = z.object({
  type: z.enum(["simple", "combo", "custom_request"]),
  pricingUnit: z.enum(["item", "page", "job"]),
  nameAr: z.string().trim().min(1).max(150),
  nameEn: z.string().trim().min(1).max(150),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  categoryId: z.string().optional(),
  shortDescriptionAr: z.string().trim().max(300).optional(),
  shortDescriptionEn: z.string().trim().max(300).optional(),
  descriptionAr: z.string().trim().max(4000).optional(),
  descriptionEn: z.string().trim().max(4000).optional(),
  price: zNumOrBlank(0),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  lowStockThreshold: zNumOrBlank(5),
  comboForceAvailable: z.boolean().default(false),
  variants: z.array(variantInputZodSchema).default([]),
  comboComponents: z.array(comboComponentInputZodSchema).default([]),
});
