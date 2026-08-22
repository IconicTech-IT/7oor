"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import { toast } from "sonner";
import { X, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createSalesReturnAction } from "@/lib/actions/returns";
import { formatEGP } from "@/lib/currency";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

export type ReturnableOrderItem = {
  salesOrderItemId: string;
  name: string;
  unitPrice: number;
  returnable: number;
};

type Props = {
  salesOrderId: string;
  items: ReturnableOrderItem[];
};

export function SalesReturnDialog({ salesOrderId, items }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("admin.orders");

  if (items.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-danger/40 px-5 py-2.5 text-sm font-bold text-danger hover:bg-danger/10"
      >
        <span className="inline-flex items-center gap-1.5">
          <Undo2 className="h-4 w-4" />
          {t("returns.create")}
        </span>
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
                qtyByItem: Object.fromEntries(items.map((i) => [i.salesOrderItemId, 0])) as Record<
                  string,
                  number
                >,
                restockByItem: Object.fromEntries(items.map((i) => [i.salesOrderItemId, true])) as Record<
                  string,
                  boolean
                >,
              }}
              onSubmit={async (values, { setSubmitting }) => {
                const returnItems = items
                  .map((i) => ({
                    salesOrderItemId: i.salesOrderItemId,
                    qty: Number(values.qtyByItem[i.salesOrderItemId]) || 0,
                    restock: Boolean(values.restockByItem[i.salesOrderItemId]),
                  }))
                  .filter((i) => i.qty > 0);

                if (returnItems.length === 0) {
                  toast.error(t("returns.selectAtLeastOne"));
                  setSubmitting(false);
                  return;
                }

                const result = await createSalesReturnAction({
                  salesOrderId,
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
                      <div key={item.salesOrderItemId} className="rounded-xl border border-border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{item.name}</p>
                            <p className="text-xs text-muted">
                              {formatEGP(item.unitPrice, "en")} ·{" "}
                              {t("returns.returnable", { qty: item.returnable })}
                            </p>
                          </div>
                          <Field
                            type="number"
                            min={0}
                            max={item.returnable}
                            name={`qtyByItem.${item.salesOrderItemId}`}
                            className="w-20 rounded-lg border border-border px-2 py-1.5 text-end text-sm focus:border-primary focus:outline-none"
                          />
                        </div>
                        <label className="mt-2 flex items-center gap-2 text-xs font-medium text-muted">
                          <Field type="checkbox" name={`restockByItem.${item.salesOrderItemId}`} />
                          {t("returns.restock")}
                        </label>
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
