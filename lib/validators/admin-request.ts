import * as yup from "yup";
import { z } from "zod";

export const REQUEST_STATUSES = [
  "new",
  "in_review",
  "quoted",
  "accepted",
  "rejected",
  "completed",
] as const;

export const updateRequestStatusSchema = yup.object({
  status: yup.string().oneOf(REQUEST_STATUSES).required(),
  adminNotes: yup.string().trim().max(2000).optional(),
});

export type UpdateRequestStatusValues = yup.InferType<typeof updateRequestStatusSchema>;

export const updateRequestStatusZodSchema = z.object({
  status: z.enum(REQUEST_STATUSES),
  adminNotes: z.string().trim().max(2000).optional(),
});
