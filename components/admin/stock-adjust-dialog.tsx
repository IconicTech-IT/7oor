"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import { toast } from "sonner";
import { X, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { adjustStockAction } from "@/lib/actions/inventory";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

type Props = {
  productId: string;
  variantId: string | null;
  label: string;
};

export function StockAdjustDialog({ productId, variantId, label }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("admin.inventory");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold hover:border-primary"
      >
        <Wrench className="h-3.5 w-3.5" />
        {t("adjust")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{t("adjustDialogTitle", { label })}</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-foreground/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <Formik
              initialValues={{ direction: "in", qty: 1, reason: "adjustment", notes: "" }}
              onSubmit={async (values, { setSubmitting }) => {
                const result = await adjustStockAction({
                  productId,
                  variantId,
                  direction: values.direction as "in" | "out",
                  qty: Number(values.qty),
                  reason: values.reason as "adjustment" | "damaged",
                  notes: values.notes,
                });
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success(t("toastAdjusted"));
                  setOpen(false);
                  router.refresh();
                }
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">{t("form.direction")}</label>
                    <Field as="select" name="direction" className={inputClass}>
                      <option value="in">{t("form.directionIn")}</option>
                      <option value="out">{t("form.directionOut")}</option>
                    </Field>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">{t("form.quantity")}</label>
                    <Field type="number" min={1} name="qty" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">{t("form.reason")}</label>
                    <Field as="select" name="reason" className={inputClass}>
                      <option value="adjustment">{t("form.reasonAdjustment")}</option>
                      <option value="damaged">{t("form.reasonDamaged")}</option>
                    </Field>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">{t("form.notes")}</label>
                    <Field as="textarea" rows={2} name="notes" className={inputClass} />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
                  >
                    {isSubmitting ? t("form.saving") : t("form.saveAdjustment")}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </>
  );
}
