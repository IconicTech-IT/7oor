import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrderDetailAdmin } from "@/lib/data/orders";
import { formatEGP } from "@/lib/currency";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { PaymentScreenshotViewer } from "@/components/admin/payment-screenshot-viewer";

export const dynamic = "force-dynamic";

const FULFILLMENT_KEY: Record<string, "pickup" | "delivery"> = {
  pickup: "pickup",
  delivery: "delivery",
};

const PAYMENT_METHOD_KEY: Record<string, "cash" | "instapay" | "vodafoneCash" | "otherWallet"> = {
  cash: "cash",
  instapay: "instapay",
  vodafone_cash: "vodafoneCash",
  other_wallet: "otherWallet",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetailAdmin(id);
  if (!order) notFound();

  const t = await getTranslations("admin.orders");
  const tAccounting = await getTranslations("admin.accounting");
  const tCheckout = await getTranslations("checkout");

  const fulfillmentKey = FULFILLMENT_KEY[order.fulfillment_method];
  const fulfillmentLabel = fulfillmentKey ? tCheckout(fulfillmentKey) : order.fulfillment_method;
  const paymentKey = PAYMENT_METHOD_KEY[order.payment_method];
  const paymentLabel = paymentKey ? tCheckout(paymentKey) : order.payment_method;

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{order.order_number}</h1>
          <p className="text-sm text-muted">
            {new Date(order.created_at).toLocaleString("en-GB")}
          </p>
        </div>
        <OrderStatusActions orderId={order.id} status={order.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">{t("detail.customer")}</p>
          <p className="mt-1 font-semibold">{order.customer?.full_name ?? "—"}</p>
          <p className="text-sm text-muted">{order.customer?.phone ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">{t("detail.fulfillment")}</p>
          <p className="mt-1 font-semibold capitalize">{fulfillmentLabel}</p>
          {order.delivery_address && <p className="text-sm text-muted">{order.delivery_address}</p>}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">{t("detail.payment")}</p>
          <p className="mt-1 font-semibold capitalize">{paymentLabel}</p>
          {order.payment_screenshot_url && (
            <div className="mt-1">
              <PaymentScreenshotViewer path={order.payment_screenshot_url} />
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">{t("detail.invoice")}</p>
          {order.invoice ? (
            <>
              <p className="mt-1 font-semibold">{order.invoice.invoice_number}</p>
              <p className="text-sm text-muted capitalize">
                {tAccounting.has(`invoiceStatus.${order.invoice.status}`)
                  ? tAccounting(`invoiceStatus.${order.invoice.status}` as "invoiceStatus.paid")
                  : order.invoice.status}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">{t("detail.notGenerated")}</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <p className="mb-3 text-xs font-bold uppercase text-muted">{t("detail.items")}</p>
        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.qty}× {item.name_snapshot_en}
              </span>
              <div className="flex items-center gap-4">
                {item.cogs_total !== null && (
                  <span className="text-xs text-muted">
                    {t("detail.cogs")} {formatEGP(item.cogs_total, "en")}
                  </span>
                )}
                <span className="font-semibold">{formatEGP(item.line_total, "en")}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>{t("detail.subtotal")}</span>
            <span>{formatEGP(order.subtotal, "en")}</span>
          </div>
          {order.delivery_fee > 0 && (
            <div className="flex justify-between text-muted">
              <span>{tCheckout("deliveryFee")}</span>
              <span>{formatEGP(order.delivery_fee, "en")}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold">
            <span>{tCheckout("total")}</span>
            <span className="text-primary">{formatEGP(order.total, "en")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
