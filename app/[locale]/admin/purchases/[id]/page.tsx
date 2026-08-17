import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPurchaseOrderDetail } from "@/lib/data/purchases";
import { formatEGP } from "@/lib/currency";
import { PurchaseOrderActions } from "@/components/admin/purchase-order-actions";

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
  const total = po.items.reduce((sum, i) => sum + i.qty_ordered * i.unit_cost, 0);

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
    </div>
  );
}
