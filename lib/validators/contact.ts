import * as yup from "yup";

export const contactSchema = yup.object({
  name: yup.string().trim().min(2).max(100).required(),
  contact: yup.string().trim().min(3).max(150).required(),
  message: yup.string().trim().min(5).max(2000).required(),
});

export type ContactValues = yup.InferType<typeof contactSchema>;
