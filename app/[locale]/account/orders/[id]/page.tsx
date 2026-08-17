import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { getOrderDetail } from "@/lib/data/orders";
import { formatEGP } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order) notFound();

  const t = await getTranslations("checkout");
  const tStatus = await getTranslations("account.orderStatus");
  const locale = await getLocale();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold">{order.order_number}</h2>
          <p className="text-sm text-muted">
            {new Date(order.created_at).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-EG")}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
          {tStatus(order.status)}
        </span>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.qty}× {locale === "ar" ? item.name_snapshot_ar : item.name_snapshot_en}
              </span>
              <span className="font-semibold">{formatEGP(item.line_total, locale)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>{t("total")}</span>
            <span className="font-extrabold text-primary">{formatEGP(order.total, locale)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold text-muted">{t("fulfillment")}</p>
          <p className="mt-1 font-semibold">
            {t(order.fulfillment_method)}
            {order.delivery_address ? ` — ${order.delivery_address}` : ""}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold text-muted">{t("payment")}</p>
          <p className="mt-1 font-semibold">{order.payment_method}</p>
        </div>
      </div>

      {order.invoice && (
        <a
          href={`/api/invoices/${order.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Download className="h-4 w-4" />
          {t("downloadInvoice")}
        </a>
      )}
    </div>
  );
}
