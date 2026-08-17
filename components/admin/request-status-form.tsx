"use client";

import { Formik, Form, Field } from "formik";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  updateRequestStatusSchema,
  REQUEST_STATUSES,
  type UpdateRequestStatusValues,
} from "@/lib/validators/admin-request";
import { updateRequestStatusAction } from "@/lib/actions/admin-requests";

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

export function RequestStatusForm({
  requestId,
  status,
  adminNotes,
}: {
  requestId: string;
  status: string;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const t = useTranslations("admin.requests");
  const tStatus = useTranslations("requests.status");
  const tCommon = useTranslations("common");

  return (
    <Formik<UpdateRequestStatusValues>
      initialValues={{ status: status as UpdateRequestStatusValues["status"], adminNotes: adminNotes ?? "" }}
      validationSchema={updateRequestStatusSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const result = await updateRequestStatusAction(requestId, values);
        if (result.error) toast.error(result.error);
        else {
          toast.success(t("toastUpdated"));
          router.refresh();
        }
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">{t("form.status")}</label>
            <Field as="select" name="status" className={inputClass}>
              {REQUEST_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {tStatus(s)}
                </option>
              ))}
            </Field>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">{t("form.adminNotes")}</label>
            <Field as="textarea" rows={3} name="adminNotes" className={inputClass} />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-fit rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
          >
            {isSubmitting ? t("form.saving") : tCommon("save")}
          </button>
        </Form>
      )}
    </Formik>
  );
}
