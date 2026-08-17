"use client";

import { Formik, Form, Field } from "formik";
import * as yup from "yup";
import { toast } from "sonner";
import { updateDeliveryFeeAction } from "@/lib/actions/settings";

const schema = yup.object({ amount: yup.number().min(0).required() });

export function DeliveryFeeForm({ initialAmount }: { initialAmount: number }) {
  return (
    <Formik
      initialValues={{ amount: initialAmount }}
      validationSchema={schema}
      onSubmit={async (values, { setSubmitting }) => {
        const result = await updateDeliveryFeeAction(Number(values.amount));
        if (result.error) toast.error(result.error);
        else toast.success("Delivery fee updated");
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="flex items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">
              Delivery fee (EGP)
            </label>
            <Field
              type="number"
              step="0.01"
              min={0}
              name="amount"
              className="w-40 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
