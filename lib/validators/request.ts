import * as yup from "yup";

export const requestSchema = yup.object({
  name: yup.string().trim().min(2).max(100).required(),
  contact: yup.string().trim().min(3).max(150).required(),
  category: yup.string().trim().max(100).optional(),
  description: yup.string().trim().min(5).max(2000).required(),
  qtyOrBudget: yup.string().trim().max(200).optional(),
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
});

export type RequestValues = yup.InferType<typeof requestSchema>;
