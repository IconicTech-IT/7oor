"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { manualSaleSchema } from "@/lib/validators/manual-sale";
import { createManualSaleAction } from "@/lib/actions/admin-orders";
import { formatEGP } from "@/lib/currency";
import { localized } from "@/lib/types";
import type { ProductWithRelations } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

const PAYMENT_METHODS = ["cash", "instapay", "vodafone_cash", "other_wallet"] as const;

type Props = {
  products: ProductWithRelations[];
};

function unitPriceOf(product: ProductWithRelations | undefined, variantId: string) {
  if (!product) return 0;
  const variant = product.variants.find((v) => v.id === variantId);
  return variant?.price ?? product.price;
}

export function ManualSaleForm({ products }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.orders.manualSale");
  const tCommon = useTranslations("admin.common");

  return (
    <Formik
      initialValues={{
        paymentMethod: "cash" as (typeof PAYMENT_METHODS)[number],
        notes: "",
        items: [{ productId: "", variantId: "", qty: 1 }],
      }}
      validationSchema={manualSaleSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const result = await createManualSaleAction(values);
        if (result.error) {
          toast.error(result.error);
          setSubmitting(false);
          return;
        }
        toast.success(t("toastCreated"));
        router.push(`/admin/orders/${result.id}`);
      }}
    >
      {({ values, isSubmitting }) => {
        const total = values.items.reduce((sum, item) => {
          const product = products.find((p) => p.id === item.productId);
          return sum + unitPriceOf(product, item.variantId) * (item.qty || 0);
        }, 0);

        return (
          <Form className="flex flex-col gap-6">
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-bold">{t("lineItems")}</h2>
              <FieldArray name="items">
                {({ push, remove }) => (
                  <div className="flex flex-col gap-3">
                    {values.items.map((item, i) => {
                      const product = products.find((p) => p.id === item.productId);
                      const unitPrice = unitPriceOf(product, item.variantId);
                      return (
                        <div key={i} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-9">
                          <div className="sm:col-span-3">
                            <label className="mb-1 block text-xs font-semibold text-muted">
                              {t("product")}
                            </label>
                            <Field as="select" name={`items.${i}.productId`} className={inputClass}>
                              <option value="">{tCommon("selectPlaceholder")}</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {localized(locale, p.name_ar, p.name_en)}
                                </option>
                              ))}
                            </Field>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-muted">
                              {t("variant")}
                            </label>
                            <Field as="select" name={`items.${i}.variantId`} className={inputClass}>
                              <option value="">{tCommon("noneOption")}</option>
                              {product?.variants.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {localized(locale, v.name_ar, v.name_en)}
                                </option>
                              ))}
                            </Field>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-muted">{t("qty")}</label>
                            <Field type="number" min={1} name={`items.${i}.qty`} className={inputClass} />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-muted">
                              {t("lineTotal")}
                            </label>
                            <p className="rounded-lg border border-transparent px-3 py-2 text-sm font-bold">
                              {formatEGP(unitPrice * (item.qty || 0), locale)}
                            </p>
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => remove(i)}
                              className="rounded-lg border border-danger/30 p-2 text-danger hover:bg-danger/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => push({ productId: "", variantId: "", qty: 1 })}
                      className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:border-primary"
                    >
                      <Plus className="h-3.5 w-3.5" /> {t("addItem")}
                    </button>
                  </div>
                )}
              </FieldArray>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <label className="mb-1 block text-xs font-semibold text-muted">{t("paymentMethod")}</label>
              <Field as="select" name="paymentMethod" className={inputClass}>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {t(`payment.${method}`)}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="paymentMethod" component="p" className="mt-1 text-xs text-danger" />

              <label className="mb-1 mt-4 block text-xs font-semibold text-muted">{t("notes")}</label>
              <Field as="textarea" rows={2} name="notes" className={inputClass} />

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm font-bold text-muted">{t("total")}</span>
                <span className="text-lg font-extrabold text-primary">{formatEGP(total, locale)}</span>
              </div>
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-fit rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
            >
              {isSubmitting ? t("saving") : t("save")}
            </button>
          </Form>
        );
      }}
    </Formik>
  );
}
