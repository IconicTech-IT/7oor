import * as yup from "yup";
import { z } from "zod";

const ROLES = ["customer", "staff", "admin"] as const;

export const setRoleSchema = yup.object({
  userId: yup.string().trim().uuid().required(),
  role: yup.string().oneOf(ROLES).required(),
});

export type SetRoleValues = yup.InferType<typeof setRoleSchema>;

export const setRoleZodSchema = z.object({
  userId: z.string().trim().uuid(),
  role: z.enum(ROLES),
});
