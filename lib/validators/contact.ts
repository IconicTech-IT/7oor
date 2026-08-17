import * as yup from "yup";
import { z } from "zod";

export const contactSchema = yup.object({
  name: yup.string().trim().min(2).max(100).required(),
  contact: yup.string().trim().min(3).max(150).required(),
  message: yup.string().trim().min(5).max(2000).required(),
});

export type ContactValues = yup.InferType<typeof contactSchema>;

export const contactZodSchema = z.object({
  name: z.string().trim().min(2).max(100),
  contact: z.string().trim().min(3).max(150),
  message: z.string().trim().min(5).max(2000),
});
