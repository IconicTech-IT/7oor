"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { KeyRound, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { resetUserPasswordAction } from "@/lib/actions/admin-staff";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

const schema = yup.object({
  password: yup.string().min(6).required(),
});

export function ResetPasswordDialog({ userId, label }: { userId: string; label: string }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("admin.staffPage.resetPassword");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-border p-1.5 hover:border-primary"
        aria-label={t("action")}
        title={t("action")}
      >
        <KeyRound className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">{t("title", { label })}</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-foreground/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <Formik
              initialValues={{ password: "" }}
              validationSchema={schema}
              onSubmit={async (values, { setSubmitting }) => {
                const result = await resetUserPasswordAction(userId, values.password);
                setSubmitting(false);
                if (result.error) {
                  toast.error(result.error);
                  return;
                }
                toast.success(t("toastUpdated"));
                setOpen(false);
              }}
            >
              {({ isSubmitting }) => (
                <Form className="flex flex-col gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted">
                      {t("newPassword")}
                    </label>
                    <Field
                      type="password"
                      name="password"
                      className={inputClass}
                      autoComplete="new-password"
                    />
                    <ErrorMessage name="password" component="p" className="mt-1 text-xs text-danger" />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
                  >
                    {isSubmitting ? t("saving") : t("save")}
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
