import * as yup from "yup";
import { z } from "zod";

export const loginSchema = yup.object({
  email: yup.string().trim().email().required(),
  password: yup.string().min(6).required(),
});

export type LoginValues = yup.InferType<typeof loginSchema>;

export const loginZodSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export const registerSchema = yup.object({
  fullName: yup.string().trim().min(2).max(100).required(),
  phone: yup.string().trim().min(6).max(30).required(),
  email: yup.string().trim().email().required(),
  password: yup.string().min(6).required(),
});

export type RegisterValues = yup.InferType<typeof registerSchema>;

export const registerZodSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email(),
  password: z.string().min(6),
});

/** Only allow a same-site relative path — blocks `?next=https://evil.example` open redirects. */
export function sanitizeRedirectPath(path: string | undefined | null): string {
  if (!path) return "/";
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}
