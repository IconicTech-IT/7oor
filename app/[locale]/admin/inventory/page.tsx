import { AlertTriangle } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getInventoryOverview, getRecentMovements } from "@/lib/data/inventory";
import { StockAdjustDialog } from "@/components/admin/stock-adjust-dialog";
import { InventoryRealtimeBoundary } from "@/components/admin/inventory-realtime-boundary";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const [rows, movements] = await Promise.all([getInventoryOverview(), getRecentMovements(30)]);
  const t = await getTranslations("admin.inventory");
  const locale = await getLocale();

  return (
    <InventoryRealtimeBoundary>
    <div>
      <h1 className="text-2xl font-extrabold">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-bold uppercase text-muted">
              <th className="px-4 py-3 text-start">{t("table.product")}</th>
              <th className="px-4 py-3 text-end">{t("table.onHand")}</th>
              <th className="px-4 py-3 text-end">{t("table.reserved")}</th>
              <th className="px-4 py-3 text-end">{t("table.available")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isLow = row.available <= row.lowStockThreshold;
              const productName = locale === "ar" ? row.productNameAr : row.productNameEn;
              const variantName = locale === "ar" ? row.variantNameAr : row.variantNameEn;
              return (
                <tr key={`${row.productId}:${row.variantId ?? ""}`} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{productName}</p>
                    {variantName && <p className="text-xs text-muted">{variantName}</p>}
                  </td>
                  <td className="px-4 py-3 text-end">{row.onHand}</td>
                  <td className="px-4 py-3 text-end text-muted">{row.reserved}</td>
                  <td className="px-4 py-3 text-end">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        isLow ? "text-danger" : "text-success"
                      }`}
                    >
                      {isLow && <AlertTriangle className="h-3.5 w-3.5" />}
                      {row.available}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <StockAdjustDialog
                      productId={row.productId}
                      variantId={row.variantId}
                      label={variantName ? `${productName} — ${variantName}` : productName}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-lg font-bold">{t("recentMovements")}</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-bold uppercase text-muted">
              <th className="px-4 py-3 text-start">{t("table.product")}</th>
              <th className="px-4 py-3 text-start">{t("table.reason")}</th>
              <th className="px-4 py-3 text-end">{t("table.qty")}</th>
              <th className="px-4 py-3 text-start">{t("table.date")}</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => {
              const productName = locale === "ar" ? m.productNameAr : m.productNameEn;
              const variantName = locale === "ar" ? m.variantNameAr : m.variantNameEn;
              return (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  {productName}
                  {variantName && <span className="text-muted"> — {variantName}</span>}
                </td>
                <td className="px-4 py-3 capitalize text-muted">
                  {t.has(`reasons.${m.reason}`)
                    ? t(`reasons.${m.reason}` as "reasons.adjustment")
                    : m.reason.replace(/[-_]/g, " ")}
                </td>
                <td
                  className={`px-4 py-3 text-end font-semibold ${
                    m.direction === "in" ? "text-success" : "text-danger"
                  }`}
                >
                  {m.direction === "in" ? "+" : "-"}
                  {m.qty}
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {new Date(m.createdAt).toLocaleString("en-GB")}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    </InventoryRealtimeBoundary>
  );
}
