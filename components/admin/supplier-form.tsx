"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { supplierSchema } from "@/lib/validators/purchase";
import { createSupplierAction } from "@/lib/actions/suppliers";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

export function SupplierForm({ onDone }: { onDone?: (createdId?: string) => void }) {
  const t = useTranslations("admin.purchases");

  return (
    <Formik
      initialValues={{ name: "", phone: "", email: "", address: "" }}
      validationSchema={supplierSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        const result = await createSupplierAction(values);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(t("toastSupplierAdded"));
          resetForm();
          onDone?.(result.id);
        }
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">{t("supplierForm.name")}</label>
            <Field name="name" className={inputClass} />
            <ErrorMessage name="name" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">{t("supplierForm.phone")}</label>
            <Field name="phone" dir="ltr" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">{t("supplierForm.email")}</label>
            <Field name="email" dir="ltr" className={inputClass} />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          >
            {t("supplierForm.addSupplier")}
          </button>
        </Form>
      )}
    </Formik>
  );
}
