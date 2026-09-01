"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

const schema = yup.object({
  password: yup.string().min(6).required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "passwordsMustMatch")
    .required(),
});

export function ChangePasswordForm() {
  const t = useTranslations("admin.settings.changePassword");

  return (
    <Formik
      initialValues={{ password: "", confirmPassword: "" }}
      validationSchema={schema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password: values.password });
        setSubmitting(false);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success(t("toastUpdated"));
        resetForm();
      }}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">{t("newPassword")}</label>
            <Field type="password" name="password" className={inputClass} autoComplete="new-password" />
            <ErrorMessage name="password" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">{t("confirmPassword")}</label>
            <Field type="password" name="confirmPassword" className={inputClass} autoComplete="new-password" />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-xs text-danger">{t("passwordsMustMatch")}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-fit rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          >
            {isSubmitting ? t("saving") : t("save")}
          </button>
        </Form>
      )}
    </Formik>
  );
}
