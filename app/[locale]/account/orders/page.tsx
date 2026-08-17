import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMyOrders } from "@/lib/data/orders";
import { formatEGP } from "@/lib/currency";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  confirmed: "bg-warning/10 text-warning",
  done: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
};

export default async function AccountOrdersPage() {
  const orders = await getMyOrders();
  const t = await getTranslations("account");
  const tStatus = await getTranslations("account.orderStatus");
  const locale = await getLocale();

  if (orders.length === 0) {
    return <p className="py-16 text-center text-muted">{t("noOrders")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
        >
          <div>
            <p className="font-bold">{order.order_number}</p>
            <p className="mt-1 text-xs text-muted">
              {new Date(order.created_at).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-EG")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-extrabold text-primary">
              {formatEGP(order.total, locale)}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[order.status] ?? ""}`}
            >
              {tStatus(order.status)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
