"use client";

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { registerSchema } from "@/lib/validators/auth";
import { registerAction } from "@/lib/actions/auth";

const inputClass =
  "w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none";

export function RegisterForm() {
  const t = useTranslations("auth");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  if (needsConfirmation) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center text-sm">
        📩 Check your email to confirm your account before signing in.
      </div>
    );
  }

  return (
    <Formik
      initialValues={{ fullName: "", phone: "", email: "", password: "" }}
      validationSchema={registerSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const result = await registerAction(values);
        if (result?.error) {
          toast.error(result.error);
        } else if (result?.needsConfirmation) {
          setNeedsConfirmation(true);
        }
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("fullName")}</label>
            <Field name="fullName" className={inputClass} />
            <ErrorMessage name="fullName" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("phone")}</label>
            <Field name="phone" type="tel" dir="ltr" className={inputClass} />
            <ErrorMessage name="phone" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("email")}</label>
            <Field type="email" name="email" className={inputClass} />
            <ErrorMessage name="email" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">{t("password")}</label>
            <Field type="password" name="password" className={inputClass} />
            <ErrorMessage name="password" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {t("createAccount")}
          </button>
          <p className="text-center text-sm text-muted">
            {t("haveAccount")}{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              {t("signIn")}
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
}
