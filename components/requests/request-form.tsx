"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { useState } from "react";
import { requestSchema } from "@/lib/validators/request";
import { submitRequestAction } from "@/lib/actions/requests";
import { localized } from "@/lib/types";
import type { Category } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none";

type Props = {
  categories: Category[];
  prefillDescription?: string;
};

type FormValues = {
  name: string;
  contact: string;
  category: string;
  description: string;
  qtyOrBudget: string;
  fulfillmentMethod: "pickup" | "delivery";
  deliveryAddress: string;
};

export function RequestForm({ categories, prefillDescription }: Props) {
  const t = useTranslations("requests");
  const tCheckout = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center text-sm font-medium">
        ✅ {t("success")}
      </div>
    );
  }

  const initialValues: FormValues = {
    name: "",
    contact: "",
    category: "",
    description: prefillDescription ?? "",
    qtyOrBudget: "",
    fulfillmentMethod: "pickup",
    deliveryAddress: "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={requestSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const formData = new FormData();
        formData.set("name", values.name);
        formData.set("contact", values.contact);
        if (values.category) formData.set("category", values.category);
        formData.set("description", values.description);
        if (values.qtyOrBudget) formData.set("qtyOrBudget", values.qtyOrBudget);
        formData.set("fulfillmentMethod", values.fulfillmentMethod);
        if (values.deliveryAddress) formData.set("deliveryAddress", values.deliveryAddress);
        if (file) formData.set("attachment", file);

        const result = await submitRequestAction(formData);
        if (result.error) {
          toast.error(result.error);
        } else {
          setSubmitted(true);
        }
        setSubmitting(false);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("name")}</label>
            <Field name="name" className={inputClass} />
            <ErrorMessage name="name" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("contact")}</label>
            <Field name="contact" className={inputClass} />
            <ErrorMessage name="contact" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("category")}</label>
            <Field as="select" name="category" className={inputClass}>
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={localized(locale, c.name_ar, c.name_en)}>
                  {localized(locale, c.name_ar, c.name_en)}
                </option>
              ))}
            </Field>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("description")}</label>
            <Field as="textarea" rows={4} name="description" className={inputClass} />
            <ErrorMessage name="description" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("qtyOrBudget")}</label>
            <Field name="qtyOrBudget" className={inputClass} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">{tCheckout("fulfillment")}</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Field type="radio" name="fulfillmentMethod" value="pickup" />
                {tCheckout("pickup")}
              </label>
              {/* Delivery is temporarily paused — kept in the UI (disabled) and fully
                  wired server-side so it can be switched back on later. */}
              <label className="flex items-center gap-2 text-sm text-muted">
                <Field type="radio" name="fulfillmentMethod" value="delivery" disabled />
                {tCheckout("delivery")}{" "}
                <span className="text-xs">({tCheckout("deliveryUnavailable")})</span>
              </label>
            </div>
          </div>

          {values.fulfillmentMethod === "delivery" && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                {tCheckout("deliveryAddress")}
              </label>
              <Field name="deliveryAddress" className={inputClass} />
              <ErrorMessage name="deliveryAddress" component="p" className="mt-1 text-xs text-danger" />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("attachment")}</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.currentTarget.files?.[0] ?? null)}
              className="w-full text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {isSubmitting ? tCommon("loading") : t("submit")}
          </button>
        </Form>
      )}
    </Formik>
  );
}
