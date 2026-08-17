"use client";

import { useState } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { purchaseOrderSchema } from "@/lib/validators/purchase";
import { createPurchaseOrderAction } from "@/lib/actions/purchases";
import { SupplierForm } from "./supplier-form";
import type { ProductWithRelations } from "@/lib/types";
import type { Tables } from "@/lib/database.types";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

type Props = {
  suppliers: Tables<"suppliers">[];
  products: ProductWithRelations[];
};

export function PurchaseOrderForm({ suppliers, products }: Props) {
  const router = useRouter();
  const [showNewSupplier, setShowNewSupplier] = useState(false);

  return (
    <Formik
      initialValues={{
        supplierId: suppliers[0]?.id ?? "",
        notes: "",
        items: [{ productId: "", variantId: "", qtyOrdered: 1, unitCost: 0 }],
      }}
      validationSchema={purchaseOrderSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const result = await createPurchaseOrderAction(values);
        if (result.error) {
          toast.error(result.error);
          setSubmitting(false);
          return;
        }
        toast.success("Purchase order created");
        router.push(`/admin/purchases/${result.id}`);
      }}
    >
      {({ values, isSubmitting }) => (
        <Form className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted">Supplier</label>
              <button
                type="button"
                onClick={() => setShowNewSupplier((v) => !v)}
                className="text-xs font-bold text-primary hover:underline"
              >
                + New supplier
              </button>
            </div>
            <Field as="select" name="supplierId" className={`mt-1 ${inputClass}`}>
              <option value="">— Select —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Field>
            <ErrorMessage name="supplierId" component="p" className="mt-1 text-xs text-danger" />

            {showNewSupplier && (
              <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                <SupplierForm
                  onDone={() => {
                    setShowNewSupplier(false);
                    router.refresh();
                  }}
                />
              </div>
            )}

            <label className="mb-1 mt-4 block text-xs font-semibold text-muted">Notes</label>
            <Field as="textarea" rows={2} name="notes" className={inputClass} />
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-bold">Line items</h2>
            <FieldArray name="items">
              {({ push, remove }) => (
                <div className="flex flex-col gap-3">
                  {values.items.map((item, i) => {
                    const product = products.find((p) => p.id === item.productId);
                    return (
                      <div key={i} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-8">
                        <div className="sm:col-span-3">
                          <label className="mb-1 block text-xs font-semibold text-muted">Product</label>
                          <Field as="select" name={`items.${i}.productId`} className={inputClass}>
                            <option value="">— Select —</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name_en}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs font-semibold text-muted">Variant</label>
                          <Field as="select" name={`items.${i}.variantId`} className={inputClass}>
                            <option value="">— None —</option>
                            {product?.variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name_en}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-muted">Qty</label>
                          <Field type="number" min={1} name={`items.${i}.qtyOrdered`} className={inputClass} />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-muted">Unit cost</label>
                          <Field
                            type="number"
                            step="0.01"
                            min={0}
                            name={`items.${i}.unitCost`}
                            className={inputClass}
                          />
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
                    onClick={() => push({ productId: "", variantId: "", qtyOrdered: 1, unitCost: 0 })}
                    className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:border-primary"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add item
                  </button>
                </div>
              )}
            </FieldArray>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-fit rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create purchase order"}
          </button>
        </Form>
      )}
    </Formik>
  );
}
