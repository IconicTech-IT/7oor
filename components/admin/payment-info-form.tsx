"use client";

import { Formik, Form, Field } from "formik";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { updatePaymentInfoAction } from "@/lib/actions/settings";
import { paymentInfoSchema } from "@/lib/validators/settings";
import type { PaymentInfo } from "@/lib/data/products";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

export function PaymentInfoForm({ initial }: { initial: PaymentInfo }) {
  const t = useTranslations("admin.settings");
  const tCommon = useTranslations("common");

  return (
    <Formik
      initialValues={{
        instapay: initial.instapay,
        vodafoneCash: initial.vodafoneCash,
        otherWalletNote: initial.otherWalletNote,
      }}
      validationSchema={paymentInfoSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const result = await updatePaymentInfoAction(values);
        if (result.error) toast.error(result.error);
        else toast.success(t("toastUpdated"));
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="grid gap-3 sm:grid-cols-2 lg:items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">
              {t("paymentInfo.instapay")}
            </label>
            <Field name="instapay" dir="ltr" placeholder="01xxxxxxxxx" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">
              {t("paymentInfo.vodafoneCash")}
            </label>
            <Field name="vodafoneCash" dir="ltr" placeholder="01xxxxxxxxx" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-muted">
              {t("paymentInfo.otherWalletNote")}
            </label>
            <Field as="textarea" rows={2} name="otherWalletNote" className={inputClass} />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60 sm:col-span-2 sm:w-fit"
          >
            {isSubmitting ? t("saving") : tCommon("save")}
          </button>
        </Form>
      )}
    </Formik>
  );
}
