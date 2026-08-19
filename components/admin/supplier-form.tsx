"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { supplierSchema } from "@/lib/validators/purchase";
import { createSupplierAction, updateSupplierAction, type ActionResult } from "@/lib/actions/suppliers";
import type { Supplier } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

type Props = {
  initial?: Supplier;
  onDone?: (createdId?: string) => void;
};

export function SupplierForm({ initial, onDone }: Props) {
  const isEdit = Boolean(initial);
  const t = useTranslations("admin.purchases");
  const tCommon = useTranslations("common");

  return (
    <Formik
      initialValues={{
        name: initial?.name ?? "",
        phone: initial?.phone ?? "",
        email: initial?.email ?? "",
        address: initial?.address ?? "",
      }}
      validationSchema={supplierSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        const result: ActionResult = isEdit
          ? await updateSupplierAction(initial!.id, values)
          : await createSupplierAction(values);

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(isEdit ? t("supplierForm.toastUpdated") : t("toastSupplierAdded"));
          resetForm();
          onDone?.(result.id);
        }
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
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
            <ErrorMessage name="email" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">{t("supplierForm.address")}</label>
            <Field name="address" className={inputClass} />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
            >
              {isEdit ? tCommon("save") : t("supplierForm.addSupplier")}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={() => onDone?.()}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              >
                {tCommon("cancel")}
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
}
