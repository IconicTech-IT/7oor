import * as yup from "yup";
import { z } from "zod";

export const categorySchema = yup.object({
  nameAr: yup.string().trim().min(1).max(100).required(),
  nameEn: yup.string().trim().min(1).max(100).required(),
  slug: yup
    .string()
    .trim()
    .lowercase()
    .matches(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only")
    .min(1)
    .max(80)
    .required(),
  parentId: yup.string().optional().nullable(),
});

export type CategoryValues = yup.InferType<typeof categorySchema>;

export const categoryZodSchema = z.object({
  nameAr: z.string().trim().min(1).max(100),
  nameEn: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  parentId: z.string().optional().nullable(),
});
