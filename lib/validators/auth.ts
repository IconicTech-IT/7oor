import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup.string().trim().email().required(),
  password: yup.string().min(6).required(),
});

export type LoginValues = yup.InferType<typeof loginSchema>;

export const registerSchema = yup.object({
  fullName: yup.string().trim().min(2).max(100).required(),
  phone: yup.string().trim().min(6).max(30).required(),
  email: yup.string().trim().email().required(),
  password: yup.string().min(6).required(),
});

export type RegisterValues = yup.InferType<typeof registerSchema>;
