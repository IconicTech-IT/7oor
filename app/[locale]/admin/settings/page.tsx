import { getTranslations } from "next-intl/server";
import { getDeliveryFee, getPaymentInfo } from "@/lib/data/products";
import { DeliveryFeeForm } from "@/components/admin/delivery-fee-form";
import { PaymentInfoForm } from "@/components/admin/payment-info-form";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [deliveryFee, paymentInfo] = await Promise.all([getDeliveryFee(), getPaymentInfo()]);
  const t = await getTranslations("admin.settings");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t("title")}</h1>
      <div className="mt-6 max-w-sm rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-bold">{t("deliveryFee")}</h2>
        <DeliveryFeeForm initialAmount={deliveryFee} />
      </div>
      <div className="mt-6 max-w-lg rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-1 text-sm font-bold">{t("paymentInfo.title")}</h2>
        <p className="mb-3 text-xs text-muted">{t("paymentInfo.subtitle")}</p>
        <PaymentInfoForm initial={paymentInfo} />
      </div>
      <div className="mt-6 max-w-sm rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-bold">{t("changePassword.title")}</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
