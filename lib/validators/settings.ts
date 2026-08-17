import * as yup from "yup";
import { z } from "zod";

export const deliveryFeeSchema = yup.object({
  amount: yup.number().min(0).max(100000).required(),
});

export type DeliveryFeeValues = yup.InferType<typeof deliveryFeeSchema>;

export const deliveryFeeZodSchema = z.object({
  amount: z.number().min(0).max(100000),
});
