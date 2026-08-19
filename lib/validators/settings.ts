import * as yup from "yup";
import { z } from "zod";

export const deliveryFeeSchema = yup.object({
  amount: yup.number().min(0).max(100000).required(),
});

export type DeliveryFeeValues = yup.InferType<typeof deliveryFeeSchema>;

export const deliveryFeeZodSchema = z.object({
  amount: z.number().min(0).max(100000),
});

export const paymentInfoSchema = yup.object({
  instapay: yup.string().trim().max(100).optional(),
  vodafoneCash: yup.string().trim().max(100).optional(),
  otherWalletNote: yup.string().trim().max(300).optional(),
});

export type PaymentInfoValues = yup.InferType<typeof paymentInfoSchema>;

export const paymentInfoZodSchema = z.object({
  instapay: z.string().trim().max(100).optional(),
  vodafoneCash: z.string().trim().max(100).optional(),
  otherWalletNote: z.string().trim().max(300).optional(),
});
