import { getTranslations } from "next-intl/server";
import { getAllOrdersAdmin } from "@/lib/data/orders";
import { OrdersRealtimeList } from "@/components/admin/orders-realtime-list";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersAdmin();
  const t = await getTranslations("admin.orders");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-6">
        <OrdersRealtimeList orders={orders} />
      </div>
    </div>
  );
}
