import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getPurchaseOrderDetail, getPurchaseReturns } from "@/lib/data/purchases";
import { formatEGP } from "@/lib/currency";
import { PurchaseOrderActions } from "@/components/admin/purchase-order-actions";
import { PurchaseReturnDialog, type ReturnableItem } from "@/components/admin/purchase-return-dialog";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted/10 text-muted",
  ordered: "bg-warning/10 text-warning",
  received: "bg-success/10 text-success",
};

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const po = await getPurchaseOrderDetail(id);
  if (!po) notFound();

  const t = await getTranslations("admin.purchases");
  const locale = await getLocale();
  const total = po.items.reduce((sum, i) => sum + i.qty_ordered * i.unit_cost, 0);

  const returns = po.status === "received" ? await getPurchaseReturns(po.id) : [];
  const returnableItems: ReturnableItem[] = po.items
    .map((item) => ({
      purchaseOrderItemId: item.id,
      nameAr: item.variant ? `${item.product?.name_ar} — ${item.variant.name_ar}` : (item.product?.name_ar ?? ""),
      nameEn: item.variant ? `${item.product?.name_en} — ${item.variant.name_en}` : (item.product?.name_en ?? ""),
      unitCost: item.unit_cost,
      returnable: item.qty_ordered - item.qty_returned,
    }))
    .filter((item) => item.returnable > 0);

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{po.po_number}</h1>
          <p className="text-sm text-muted">{po.supplier?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${
              STATUS_COLORS[po.status] ?? ""
            }`}
          >
            {t.has(`status.${po.status}`) ? t(`status.${po.status}` as "status.draft") : po.status}
          </span>
          <PurchaseOrderActions id={po.id} status={po.status} />
          {po.status === "received" && (
            <PurchaseReturnDialog purchaseOrderId={po.id} items={returnableItems} />
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <p className="mb-3 text-xs font-bold uppercase text-muted">{t("detail.items")}</p>
        <ul className="flex flex-col gap-3">
          {po.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.qty_ordered}× {item.product?.name_en}
                {item.variant && <span className="text-muted"> — {item.variant.name_en}</span>}
                {po.status === "received" && (
                  <span className="ms-2 text-xs text-success">
                    {t("detail.receivedQty", { qty: item.qty_received })}
                  </span>
                )}
                {item.qty_returned > 0 && (
                  <span className="ms-2 text-xs text-danger">
                    {t("returns.returnedQty", { qty: item.qty_returned })}
                  </span>
                )}
              </span>
              <span className="font-semibold">
                {formatEGP(item.unit_cost, "en")} × {item.qty_ordered} ={" "}
                {formatEGP(item.unit_cost * item.qty_ordered, "en")}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-extrabold">
          <span>{t("detail.totalCost")}</span>
          <span className="text-primary">{formatEGP(total, "en")}</span>
        </div>
      </div>

      {po.notes && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm">
          <p className="text-xs font-bold uppercase text-muted">{t("detail.notes")}</p>
          <p className="mt-1">{po.notes}</p>
        </div>
      )}

      {returns.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-bold">{t("returns.history")}</h2>
          <div className="mt-3 flex flex-col gap-3">
            {returns.map((ret) => {
              const returnTotal = ret.items.reduce((sum, i) => sum + i.line_total, 0);
              return (
                <div key={ret.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{ret.return_number}</p>
                    <p className="font-bold text-danger">-{formatEGP(returnTotal, "en")}</p>
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
