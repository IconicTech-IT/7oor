import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getOrderDetailAdmin, getSalesReturns } from "@/lib/data/orders";
import { getAllProductsAdmin } from "@/lib/data/products";
import { formatEGP } from "@/lib/currency";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { PaymentScreenshotViewer } from "@/components/admin/payment-screenshot-viewer";
import { SalesReturnDialog, type ReturnableOrderItem } from "@/components/admin/sales-return-dialog";
import { EditOrderDialog } from "@/components/admin/edit-order-dialog";

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
  const locale = await getLocale();

  const fulfillmentKey = FULFILLMENT_KEY[order.fulfillment_method];
  const fulfillmentLabel = fulfillmentKey ? tCheckout(fulfillmentKey) : order.fulfillment_method;
  const paymentKey = PAYMENT_METHOD_KEY[order.payment_method];
  const paymentLabel = paymentKey ? tCheckout(paymentKey) : order.payment_method;

  const returns = order.status === "done" ? await getSalesReturns(order.id) : [];
  const returnableItems: ReturnableOrderItem[] = order.items
    .map((item) => ({
      salesOrderItemId: item.id,
      name: locale === "ar" ? item.name_snapshot_ar : item.name_snapshot_en,
      unitPrice: item.unit_price,
      returnable: item.qty - item.qty_returned,
    }))
    .filter((item) => item.returnable > 0);

  const isEditable = order.status === "new" || order.status === "confirmed";
  const products = isEditable ? await getAllProductsAdmin() : [];
  const editableItems = order.items.map((item) => ({
    productId: item.product_id,
    variantId: item.variant_id ?? "",
    qty: item.qty,
    unitPrice: item.unit_price,
  }));

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{order.order_number}</h1>
          <p className="text-sm text-muted">
            {new Date(order.created_at).toLocaleString("en-GB")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditable && (
            <EditOrderDialog orderId={order.id} products={products} initialItems={editableItems} />
          )}
          <OrderStatusActions orderId={order.id} status={order.status} />
          {order.status === "done" && (
            <SalesReturnDialog salesOrderId={order.id} items={returnableItems} />
          )}
        </div>
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
                {item.qty}× {locale === "ar" ? item.name_snapshot_ar : item.name_snapshot_en}
                {item.qty_returned > 0 && (
                  <span className="ms-2 text-xs text-danger">
                    {t("returns.returnedQty", { qty: item.qty_returned })}
                  </span>
                )}
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
          {order.discount > 0 && (
            <div className="flex justify-between text-muted">
              <span>{t("manualSale.discount")}</span>
              <span>-{formatEGP(order.discount, "en")}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold">
            <span>{tCheckout("total")}</span>
            <span className="text-primary">{formatEGP(order.total, "en")}</span>
          </div>
        </div>
      </div>

      {order.invoice && (
        <a
          href={`/api/invoices/${order.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-bold transition-colors hover:border-primary"
        >
          <Download className="h-4 w-4" />
          {tCheckout("downloadInvoice")}
        </a>
      )}

      {returns.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-bold">{t("returns.history")}</h2>
          <div className="mt-3 flex flex-col gap-3">
            {returns.map((ret) => {
              const refundTotal = ret.items.reduce((sum, i) => sum + i.line_total, 0);
              return (
                <div key={ret.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{ret.return_number}</p>
                    <p className="font-bold text-danger">-{formatEGP(refundTotal, "en")}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(ret.created_at).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-EG")}
                    {ret.reason ? ` — ${ret.reason}` : ""}
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 text-sm">
                    {ret.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-muted">
                        <span>
                          {item.qty}× {locale === "ar" ? item.product?.name_ar : item.product?.name_en}
                          {item.variant && (
                            <span> — {locale === "ar" ? item.variant.name_ar : item.variant.name_en}</span>
                          )}
                          {!item.restocked && (
                            <span className="ms-1.5 text-xs text-warning">({t("returns.notRestocked")})</span>
                          )}
                        </span>
                        <span>{formatEGP(item.line_total, "en")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
