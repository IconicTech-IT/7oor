import { getTranslations } from "next-intl/server";
import { getSuppliers } from "@/lib/data/purchases";
import { getAllProductsAdmin } from "@/lib/data/products";
import { PurchaseOrderForm } from "@/components/admin/purchase-order-form";

export const dynamic = "force-dynamic";

export default async function NewPurchaseOrderPage() {
  const [suppliers, products] = await Promise.all([getSuppliers(), getAllProductsAdmin()]);
  const t = await getTranslations("admin.purchases");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t("newTitle")}</h1>
      <div className="mt-6">
        <PurchaseOrderForm
          suppliers={suppliers}
          products={products.filter((p) => p.type === "simple")}
        />
      </div>
    </div>
  );
}
