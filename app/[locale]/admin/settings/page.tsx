import { getTranslations } from "next-intl/server";
import { getDeliveryFee } from "@/lib/data/products";
import { DeliveryFeeForm } from "@/components/admin/delivery-fee-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const deliveryFee = await getDeliveryFee();
  const t = await getTranslations("admin.settings");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t("title")}</h1>
      <div className="mt-6 max-w-sm rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-bold">{t("deliveryFee")}</h2>
        <DeliveryFeeForm initialAmount={deliveryFee} />
      </div>
    </div>
  );
}
