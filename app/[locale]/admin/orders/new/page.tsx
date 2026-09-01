import { getTranslations } from "next-intl/server";
import { getAllProductsAdmin } from "@/lib/data/products";
import { ManualSaleForm } from "@/components/admin/manual-sale-form";

export const dynamic = "force-dynamic";

export default async function NewManualSalePage() {
  const products = await getAllProductsAdmin();
  const t = await getTranslations("admin.orders.manualSale");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t("pageTitle")}</h1>
      <div className="mt-6">
        <ManualSaleForm products={products.filter((p) => p.is_active)} />
      </div>
    </div>
  );
}
