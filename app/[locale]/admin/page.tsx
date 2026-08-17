import { Package, ShoppingCart, Warehouse, FileWarning } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getLowStockCount } from "@/lib/data/inventory";

export const dynamic = "force-dynamic";

async function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: typeof Package;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const t = await getTranslations("admin.dashboard");

  const [{ count: productCount }, { count: newOrders }, { count: catalogSize }, needsAttention] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase
        .from("sales_orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["new", "confirmed"]),
      supabase.from("products").select("*", { count: "exact", head: true }),
      getLowStockCount(),
    ]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t("title")}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("stats.activeProducts")} value={productCount ?? 0} icon={Package} />
        <StatCard label={t("stats.openOrders")} value={newOrders ?? 0} icon={ShoppingCart} />
        <StatCard label={t("stats.catalogSize")} value={catalogSize ?? 0} icon={Warehouse} />
        <StatCard label={t("stats.needsAttention")} value={needsAttention} icon={FileWarning} />
      </div>
      <p className="mt-8 text-sm text-muted">{t("subtitle")}</p>
    </div>
  );
}
