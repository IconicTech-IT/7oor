import * as yup from "yup";

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
