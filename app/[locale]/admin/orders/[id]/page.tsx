import { notFound } from "next/navigation";
import { getOrderDetailAdmin } from "@/lib/data/orders";
import { formatEGP } from "@/lib/currency";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import { PaymentScreenshotViewer } from "@/components/admin/payment-screenshot-viewer";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetailAdmin(id);
  if (!order) notFound();

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
          <p className="text-xs font-bold uppercase text-muted">Customer</p>
          <p className="mt-1 font-semibold">{order.customer?.full_name ?? "—"}</p>
          <p className="text-sm text-muted">{order.customer?.phone ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">Fulfillment</p>
          <p className="mt-1 font-semibold capitalize">{order.fulfillment_method}</p>
          {order.delivery_address && <p className="text-sm text-muted">{order.delivery_address}</p>}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">Payment</p>
          <p className="mt-1 font-semibold capitalize">{order.payment_method.replace("_", " ")}</p>
          {order.payment_screenshot_url && (
            <div className="mt-1">
              <PaymentScreenshotViewer path={order.payment_screenshot_url} />
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">Invoice</p>
          {order.invoice ? (
            <>
              <p className="mt-1 font-semibold">{order.invoice.invoice_number}</p>
              <p className="text-sm text-muted capitalize">{order.invoice.status}</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">Not yet generated</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <p className="mb-3 text-xs font-bold uppercase text-muted">Items</p>
        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.qty}× {item.name_snapshot_en}
              </span>
              <div className="flex items-center gap-4">
                {item.cogs_total !== null && (
                  <span className="text-xs text-muted">COGS {formatEGP(item.cogs_total, "en")}</span>
                )}
                <span className="font-semibold">{formatEGP(item.line_total, "en")}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatEGP(order.subtotal, "en")}</span>
          </div>
          {order.delivery_fee > 0 && (
            <div className="flex justify-between text-muted">
              <span>Delivery fee</span>
              <span>{formatEGP(order.delivery_fee, "en")}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold">
            <span>Total</span>
            <span className="text-primary">{formatEGP(order.total, "en")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
