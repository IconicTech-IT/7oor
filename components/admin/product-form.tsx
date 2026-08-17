"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { productSchema } from "@/lib/validators/product";
import { saveProductAction } from "@/lib/actions/products";
import { CategoryForm } from "./category-form";
import { ImageUploadField } from "./image-upload-field";
import type { Category } from "@/lib/types";
import type { ProductWithCombo, ProductWithRelations } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";
const labelClass = "mb-1 block text-xs font-semibold text-muted";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Props = {
  categories: Category[];
  allProducts: ProductWithRelations[];
  initial?: ProductWithCombo;
};

export function ProductForm({ categories, allProducts, initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [showQuickCreateCategory, setShowQuickCreateCategory] = useState(false);
  const t = useTranslations("admin.products.form");
  const tProducts = useTranslations("admin.products");
  const tCommon = useTranslations("admin.common");

  const topLevelCategories = categories.filter((c) => !c.parent_id);

  const initialValues = {
    type: (initial?.type ?? "simple") as "simple" | "combo" | "custom_request",
    pricingUnit: (initial?.pricing_unit ?? "item") as "item" | "page" | "job",
    nameAr: initial?.name_ar ?? "",
    nameEn: initial?.name_en ?? "",
    slug: initial?.slug ?? "",
    categoryId: initial?.category_id ?? "",
    shortDescriptionAr: initial?.short_description_ar ?? "",
    shortDescriptionEn: initial?.short_description_en ?? "",
    descriptionAr: initial?.description_ar ?? "",
    descriptionEn: initial?.description_en ?? "",
    price: initial?.price ?? 0,
    imageUrl: initial?.image_url ?? "",
    isActive: initial?.is_active ?? true,
    lowStockThreshold: initial?.low_stock_threshold ?? 5,
    comboForceAvailable: initial?.combo_force_available ?? false,
    variants: (initial?.variants ?? []).map((v) => ({
      id: v.id,
      nameAr: v.name_ar,
      nameEn: v.name_en,
      sku: v.sku ?? "",
      colorHex: v.color_hex ?? "",
      price: v.price ?? undefined,
      imageUrl: v.image_url ?? "",
    })),
    comboComponents: (initial?.combo_components ?? []).map((c) => ({
      componentProductId: c.component_product_id,
      componentVariantId: c.component_variant_id ?? "",
      qty: c.qty,
    })),
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={productSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const result = await saveProductAction(initial?.id ?? null, values);
        if (result.error) {
          toast.error(result.error);
          setSubmitting(false);
          return;
        }
        toast.success(isEdit ? tProducts("toastUpdated") : tProducts("toastCreated"));
        router.push("/admin/products");
      }}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="flex flex-col gap-8">
          <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>{t("nameEn")}</label>
              <Field
                name="nameEn"
                className={inputClass}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue("nameEn", e.target.value);
                  if (!isEdit) setFieldValue("slug", slugify(e.target.value));
                }}
              />
              <ErrorMessage name="nameEn" component="p" className="mt-1 text-xs text-danger" />
            </div>
            <div>
              <label className={labelClass}>{t("nameAr")}</label>
              <Field name="nameAr" dir="rtl" className={inputClass} />
              <ErrorMessage name="nameAr" component="p" className="mt-1 text-xs text-danger" />
            </div>
            <div>
              <label className={labelClass}>{t("slug")}</label>
              <Field name="slug" dir="ltr" className={inputClass} />
              <ErrorMessage name="slug" component="p" className="mt-1 text-xs text-danger" />
            </div>
            <div>
              <label className={labelClass}>{t("category")}</label>
              <div className="flex gap-2">
                <Field as="select" name="categoryId" className={inputClass}>
                  <option value="">{tCommon("noneOption")}</option>
                  {topLevelCategories.map((top) => (
                    <optgroup key={top.id} label={top.name_en}>
                      <option value={top.id}>{top.name_en}</option>
                      {categories
                        .filter((c) => c.parent_id === top.id)
                        .map((child) => (
                          <option key={child.id} value={child.id}>
                            &nbsp;&nbsp;{child.name_en}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </Field>
                <button
                  type="button"
                  onClick={() => setShowQuickCreateCategory((v) => !v)}
                  className="shrink-0 rounded-lg border border-border px-3 text-xs font-bold hover:border-primary"
                >
                  {t("newCategory")}
                </button>
              </div>
            </div>

            {showQuickCreateCategory && (
              <div className="sm:col-span-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                <CategoryForm
                  topLevelCategories={topLevelCategories}
                  onDone={(createdId) => {
                    if (createdId) {
                      setFieldValue("categoryId", createdId);
                      router.refresh();
                    }
                    setShowQuickCreateCategory(false);
                  }}
                />
              </div>
            )}

            <div>
              <label className={labelClass}>{t("type")}</label>
              <Field as="select" name="type" className={inputClass}>
                <option value="simple">{t("typeSimple")}</option>
                <option value="combo">{t("typeCombo")}</option>
                <option value="custom_request">{t("typeCustomRequest")}</option>
              </Field>
            </div>
            <div>
              <label className={labelClass}>{t("pricingUnit")}</label>
              <Field as="select" name="pricingUnit" className={inputClass}>
                <option value="item">{t("pricingUnitItem")}</option>
                <option value="page">{t("pricingUnitPage")}</option>
                <option value="job">{t("pricingUnitJob")}</option>
              </Field>
            </div>

            <div>
              <label className={labelClass}>{t("price")}</label>
              <Field type="number" step="0.01" name="price" className={inputClass} />
              <ErrorMessage name="price" component="p" className="mt-1 text-xs text-danger" />
            </div>
            <div>
              <label className={labelClass}>{t("lowStockThreshold")}</label>
              <Field type="number" name="lowStockThreshold" className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <ImageUploadField
                label={tProducts("imageUpload.productImage")}
                value={values.imageUrl}
                onChange={(url) => setFieldValue("imageUrl", url)}
              />
            </div>

            <div>
              <label className={labelClass}>{t("shortDescriptionEn")}</label>
              <Field as="textarea" rows={2} name="shortDescriptionEn" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("shortDescriptionAr")}</label>
              <Field as="textarea" rows={2} dir="rtl" name="shortDescriptionAr" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("descriptionEn")}</label>
              <Field as="textarea" rows={4} name="descriptionEn" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("descriptionAr")}</label>
              <Field as="textarea" rows={4} dir="rtl" name="descriptionAr" className={inputClass} />
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold">
              <Field type="checkbox" name="isActive" />
              {t("active")}
            </label>
            {values.type === "combo" && (
              <label className="flex items-center gap-2 text-sm font-semibold">
                <Field type="checkbox" name="comboForceAvailable" />
                {t("forceAvailable")}
              </label>
            )}
          </section>

          {values.type !== "combo" && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold">{t("variants")}</h2>
              </div>
              <FieldArray name="variants">
                {({ push, remove }) => (
                  <div className="flex flex-col gap-4">
                    {values.variants.map((_, i) => (
                      <div key={i} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                          <label className={labelClass}>{t("variantNameEn")}</label>
                          <Field name={`variants.${i}.nameEn`} className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>{t("variantNameAr")}</label>
                          <Field name={`variants.${i}.nameAr`} dir="rtl" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>{t("sku")}</label>
                          <Field name={`variants.${i}.sku`} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>{t("priceOverride")}</label>
                          <Field type="number" step="0.01" name={`variants.${i}.price`} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>{t("color")}</label>
                          <Field type="color" name={`variants.${i}.colorHex`} className="h-9 w-full rounded-lg border border-border" />
                        </div>
                        <div className="sm:col-span-2">
                          <ImageUploadField
                            label={tProducts("imageUpload.variantImage")}
                            value={values.variants[i].imageUrl ?? ""}
                            onChange={(url) => setFieldValue(`variants.${i}.imageUrl`, url)}
                          />
                        </div>
                        <div className="flex items-end sm:col-span-3">
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-2 text-xs font-bold text-danger hover:bg-danger/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> {t("removeVariant")}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        push({ nameAr: "", nameEn: "", sku: "", colorHex: "", price: undefined, imageUrl: "" })
                      }
                      className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:border-primary"
                    >
                      <Plus className="h-3.5 w-3.5" /> {t("addVariant")}
                    </button>
                  </div>
                )}
              </FieldArray>
            </section>
          )}

          {values.type === "combo" && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-bold">{t("bundleComponents")}</h2>
              <FieldArray name="comboComponents">
                {({ push, remove }) => (
                  <div className="flex flex-col gap-3">
                    {values.comboComponents.map((comp, i) => {
                      const selectedProduct = allProducts.find(
                        (p) => p.id === comp.componentProductId,
                      );
                      return (
                        <div key={i} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-8">
                          <div className="sm:col-span-4">
                            <label className={labelClass}>{t("componentProduct")}</label>
                            <Field as="select" name={`comboComponents.${i}.componentProductId`} className={inputClass}>
                              <option value="">{tCommon("selectPlaceholder")}</option>
                              {allProducts
                                .filter((p) => p.type !== "combo" && p.id !== initial?.id)
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name_en}
                                  </option>
                                ))}
                            </Field>
                          </div>
                          <div className="sm:col-span-2">
                            <label className={labelClass}>{t("componentVariant")}</label>
                            <Field as="select" name={`comboComponents.${i}.componentVariantId`} className={inputClass}>
                              <option value="">{t("anyNoneOption")}</option>
                              {selectedProduct?.variants.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.name_en}
                                </option>
                              ))}
                            </Field>
                          </div>
                          <div>
                            <label className={labelClass}>{t("qty")}</label>
                            <Field type="number" min={1} name={`comboComponents.${i}.qty`} className={inputClass} />
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
                      onClick={() => push({ componentProductId: "", componentVariantId: "", qty: 1 })}
                      className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold hover:border-primary"
                    >
                      <Plus className="h-3.5 w-3.5" /> {t("addComponent")}
                    </button>
                  </div>
                )}
              </FieldArray>
            </section>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
            >
              {isSubmitting ? t("saving") : isEdit ? t("saveChanges") : t("createProduct")}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
