import * as yup from "yup";

export const checkoutSchema = yup.object({
  fulfillmentMethod: yup.string().oneOf(["pickup", "delivery"]).required(),
  deliveryAddress: yup
    .string()
    .trim()
    .max(300)
    .when("fulfillmentMethod", {
      is: "delivery",
      then: (schema) => schema.min(5).required(),
      otherwise: (schema) => schema.optional(),
    }),
  paymentMethod: yup
    .string()
    .oneOf(["cash", "instapay", "vodafone_cash", "other_wallet"])
    .required(),
});

export type CheckoutValues = yup.InferType<typeof checkoutSchema>;

export const fulfillmentStepFields = ["fulfillmentMethod", "deliveryAddress"] as const;
export const paymentStepFields = ["paymentMethod"] as const;
