import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllOrdersAdmin } from "@/lib/data/orders";
import { OrdersRealtimeList } from "@/components/admin/orders-realtime-list";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const orders = await getAllOrdersAdmin(date);
  const t = await getTranslations("admin.orders");
  const tCommon = await getTranslations("admin.common");

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

      <form className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">{tCommon("date")}</label>
          <input
            type="date"
            name="date"
            defaultValue={date ?? ""}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
        >
          {tCommon("apply")}
        </button>
        {date && (
          <Link
            href="/admin/orders"
            className="rounded-lg border border-border px-4 py-2 text-sm font-bold hover:border-primary"
          >
            {tCommon("allDates")}
          </Link>
        )}
      </form>

      <div className="mt-6">
        <OrdersRealtimeList orders={orders} />
      </div>
    </div>
  );
}
