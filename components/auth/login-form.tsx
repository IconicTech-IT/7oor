"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { loginSchema } from "@/lib/validators/auth";
import { loginAction } from "@/lib/actions/auth";

const inputClass =
  "w-full rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none";

export function LoginForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={loginSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const result = await loginAction({ ...values, next });
        if (result?.error) {
          toast.error(result.error);
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-4">
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
            {t("signIn")}
          </button>
          <p className="text-center text-sm text-muted">
            {t("noAccount")}{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              {t("createAccount")}
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  );
}
