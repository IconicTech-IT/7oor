"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { contactSchema } from "@/lib/validators/contact";
import { submitContactAction } from "@/lib/actions/contact";

const initialValues = { name: "", contact: "", message: "" };
const inputClass =
  "rounded-xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none";

export function ContactForm() {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={contactSchema}
      onSubmit={async (values, { resetForm, setSubmitting }) => {
        try {
          await submitContactAction(values);
          toast.success(t("success"));
          resetForm();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : tCommon("error"));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-3">
          <div>
            <Field name="name" placeholder={t("name")} className={`w-full ${inputClass}`} />
            <ErrorMessage name="name" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <Field name="contact" placeholder={t("contactInfo")} className={`w-full ${inputClass}`} />
            <ErrorMessage name="contact" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <div>
            <Field
              as="textarea"
              name="message"
              rows={5}
              placeholder={t("message")}
              className={`w-full ${inputClass}`}
            />
            <ErrorMessage name="message" component="p" className="mt-1 text-xs text-danger" />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {isSubmitting ? tCommon("loading") : t("send")}
          </button>
        </Form>
      )}
    </Formik>
  );
}
