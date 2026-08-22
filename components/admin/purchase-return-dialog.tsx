"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import { toast } from "sonner";
import { X, Undo2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createPurchaseReturnAction } from "@/lib/actions/returns";
import { formatEGP } from "@/lib/currency";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

export type ReturnableItem = {
  purchaseOrderItemId: string;
  nameAr: string;
  nameEn: string;
  unitCost: number;
  returnable: number;
};

type Props = {
  purchaseOrderId: string;
  items: ReturnableItem[];
};

export function PurchaseReturnDialog({ purchaseOrderId, items }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.purchases");

  if (items.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:border-primary"
      >
        <Undo2 className="h-3.5 w-3.5" />
        {t("returns.create")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{t("returns.create")}</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-foreground/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <Formik
              initialValues={{
                reason: "",
                notes: "",
                qtyByItem: Object.fromEntries(items.map((i) => [i.purchaseOrderItemId, 0])) as Record<
                  string,
                  number
                >,
              }}
              onSubmit={async (values, { setSubmitting }) => {
                const returnItems = items
                  .map((i) => ({ purchaseOrderItemId: i.purchaseOrderItemId, qty: Number(values.qtyByItem[i.purchaseOrderItemId]) || 0 }))
                  .filter((i) => i.qty > 0);

                if (returnItems.length === 0) {
                  toast.error(t("returns.selectAtLeastOne"));
                  setSubmitting(false);
                  return;
                }

                const result = await createPurchaseReturnAction({
                  purchaseOrderId,
                  reason: values.reason,
                  notes: values.notes,
                  items: returnItems,
                });
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success(t("returns.toastCreated"));
                  setOpen(false);
                  router.refresh();
                }
                setSubmitting(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <div
                        key={item.purchaseOrderItemId}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {locale === "ar" ? item.nameAr : item.nameEn}
                          </p>
                          <p className="text-xs text-muted">
                            {formatEGP(item.unitCost, "en")} · {t("returns.returnable", { qty: item.returnable })}
                          </p>
                        </div>
                        <Field
                          type="number"
                          min={0}
                          max={item.returnable}
                          name={`qtyByItem.${item.purchaseOrderItemId}`}
                          className="w-20 rounded-lg border border-border px-2 py-1.5 text-end text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">{t("returns.reason")}</label>
                    <Field name="reason" className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">{t("returns.notes")}</label>
                    <Field as="textarea" rows={2} name="notes" className={inputClass} />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
                  >
                    {isSubmitting ? t("returns.saving") : t("returns.save")}
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
