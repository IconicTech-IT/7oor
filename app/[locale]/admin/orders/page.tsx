import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllOrdersAdmin } from "@/lib/data/orders";
import { OrdersRealtimeList } from "@/components/admin/orders-realtime-list";
import { DateRangeFilter } from "@/components/admin/date-range-filter";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const orders = await getAllOrdersAdmin(from, to);
  const t = await getTranslations("admin.orders");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          {t("manualSale.newSale")}
        </Link>
      </div>

      <DateRangeFilter from={from} to={to} />

      <div className="mt-6">
        <OrdersRealtimeList orders={orders} />
      </div>
    </div>
  );
}
