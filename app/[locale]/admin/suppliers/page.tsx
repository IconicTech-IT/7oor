import { getTranslations } from "next-intl/server";
import { getSuppliers } from "@/lib/data/purchases";
import { SuppliersManager } from "@/components/admin/suppliers-manager";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const suppliers = await getSuppliers();
  const t = await getTranslations("admin.purchases");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t("supplierForm.pageTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("supplierForm.pageSubtitle")}</p>
      <div className="mt-6">
        <SuppliersManager suppliers={suppliers} />
      </div>
    </div>
  );
}
