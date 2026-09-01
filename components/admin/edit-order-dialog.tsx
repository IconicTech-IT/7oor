"use client";

import { useState } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { updateOrderItemsAction } from "@/lib/actions/admin-orders";
import { formatEGP } from "@/lib/currency";
import { localized } from "@/lib/types";
import type { ProductWithRelations } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

type Item = { productId: string; variantId: string; qty: number; unitPrice?: number };

function catalogPriceOf(product: ProductWithRelations | undefined, variantId: string) {
  if (!product) return 0;
  const variant = product.variants.find((v) => v.id === variantId);
  return variant?.price ?? product.price;
}

type Props = {
  orderId: string;
  products: ProductWithRelations[];
  initialItems: Item[];
};

export function EditOrderDialog({ orderId, products, initialItems }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("admin.orders.edit");
  const tSale = useTranslations("admin.orders.manualSale");
  const tCommon = useTranslations("admin.common");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-bold transition-colors hover:border-primary"
      >
        <span className="inline-flex items-center gap-1.5">
          <Pencil className="h-4 w-4" />
          {t("editOrder")}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{t("editOrder")}</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-foreground/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <Formik
              initialValues={{ items: initialItems }}
              onSubmit={async (values, { setSubmitting }) => {
                const result = await updateOrderItemsAction(orderId, values.items);
                if (result.error) {
                  toast.error(result.error);
                  setSubmitting(false);
                  return;
                }
                toast.success(t("toastUpdated"));
                setOpen(false);
                router.refresh();
                setSubmitting(false);
              }}
            >
              {({ values, isSubmitting, setFieldValue }) => {
                const total = values.items.reduce((sum, item) => {
                  const product = products.find((p) => p.id === item.productId);
                  const price = item.unitPrice ?? catalogPriceOf(product, item.variantId);
                  return sum + price * (item.qty || 0);
                }, 0);

                return (
                  <Form className="flex flex-col gap-4">
                    <FieldArray name="items">
                      {({ push, remove }) => (
                        <div className="flex flex-col gap-3">
                          {values.items.map((item, i) => {
                            const product = products.find((p) => p.id === item.productId);
                            const price = item.unitPrice ?? catalogPriceOf(product, item.variantId);
                            return (
                              <div key={i} className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-10">
                                <div className="sm:col-span-3">
                                  <label className="mb-1 block text-xs font-semibold text-muted">
                                    {tSale("product")}
                                  </label>
                                  <Field
                                    as="select"
                                    name={`items.${i}.productId`}
                                    className={inputClass}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                      setFieldValue(`items.${i}.productId`, e.target.value);
                                      setFieldValue(`items.${i}.variantId`, "");
                                      setFieldValue(`items.${i}.unitPrice`, undefined);
                                    }}
                                  >
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
                                    {tSale("variant")}
                                  </label>
                                  <Field
                                    as="select"
                                    name={`items.${i}.variantId`}
                                    className={inputClass}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                      setFieldValue(`items.${i}.variantId`, e.target.value);
                                      setFieldValue(`items.${i}.unitPrice`, undefined);
                                    }}
                                  >
                                    <option value="">{tCommon("noneOption")}</option>
                                    {product?.variants.map((v) => (
                                      <option key={v.id} value={v.id}>
                                        {localized(locale, v.name_ar, v.name_en)}
                                      </option>
                                    ))}
                                  </Field>
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-semibold text-muted">
                                    {tSale("qty")}
                                  </label>
                                  <Field type="number" min={1} name={`items.${i}.qty`} className={inputClass} />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="mb-1 block text-xs font-semibold text-muted">
                                    {tSale("unitPrice")}
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={price}
                                    onChange={(e) =>
                                      setFieldValue(
                                        `items.${i}.unitPrice`,
                                        e.target.value === "" ? undefined : Number(e.target.value),
                                      )
                                    }
                                    className={inputClass}
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="mb-1 block text-xs font-semibold text-muted">
                                    {tSale("lineTotal")}
                                  </label>
                                  <p className="rounded-lg border border-transparent px-3 py-2 text-sm font-bold">
                                    {formatEGP(price * (item.qty || 0), locale)}
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
                            onClick={() => push({ productId: "", variantId: "", qty: 1, unitPrice: undefined })}
                            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:border-primary"
                          >
                            <Plus className="h-3.5 w-3.5" /> {tSale("addItem")}
                          </button>
                        </div>
                      )}
                    </FieldArray>

                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <span className="text-sm font-bold text-muted">{tSale("total")}</span>
                      <span className="text-lg font-extrabold text-primary">{formatEGP(total, locale)}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || values.items.length === 0}
                      className="mt-1 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
                    >
                      {isSubmitting ? t("saving") : t("save")}
                    </button>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      )}
    </>
  );
}
