"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { categorySchema } from "@/lib/validators/category";
import { createCategoryAction, updateCategoryAction, type ActionResult } from "@/lib/actions/categories";
import type { Category } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Props = {
  topLevelCategories: Category[];
  initial?: Category;
  onDone?: (createdId?: string) => void;
};

export function CategoryForm({ topLevelCategories, initial, onDone }: Props) {
  const isEdit = Boolean(initial);
  const t = useTranslations("admin.categories");
  const tCommon = useTranslations("common");

  return (
    <Formik
      initialValues={{
        nameAr: initial?.name_ar ?? "",
        nameEn: initial?.name_en ?? "",
        slug: initial?.slug ?? "",
        parentId: initial?.parent_id ?? "",
      }}
      validationSchema={categorySchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        const result: ActionResult = isEdit
          ? await updateCategoryAction(initial!.id, values)
          : await createCategoryAction(values);

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(isEdit ? t("toastUpdated") : t("toastCreated"));
          resetForm();
          onDone?.(result.id);
        }
        setSubmitting(false);
      }}
    >
      {({ setFieldValue, isSubmitting }) => (
        <Form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">{t("form.nameEn")}</label>
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
            <label className="mb-1 block text-xs font-semibold text-muted">{t("form.nameAr")}</label>
            <Field name="nameAr" dir="rtl" className={inputClass} />
            <ErrorMessage name="nameAr" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">{t("form.slug")}</label>
            <Field name="slug" dir="ltr" className={inputClass} />
            <ErrorMessage name="slug" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">{t("form.parent")}</label>
            <Field as="select" name="parentId" className={inputClass}>
              <option value="">{t("form.topLevelOption")}</option>
              {topLevelCategories
                .filter((c) => c.id !== initial?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_en}
                  </option>
                ))}
            </Field>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
            >
              {isEdit ? tCommon("save") : tCommon("add")}
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
