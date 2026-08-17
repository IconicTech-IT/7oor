import { AlertTriangle } from "lucide-react";
import { getInventoryOverview, getRecentMovements } from "@/lib/data/inventory";
import { StockAdjustDialog } from "@/components/admin/stock-adjust-dialog";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const [rows, movements] = await Promise.all([getInventoryOverview(), getRecentMovements(30)]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Inventory</h1>
      <p className="mt-1 text-sm text-muted">
        On Hand minus Reserved (open sales orders) gives what&apos;s actually free to sell.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-bold uppercase text-muted">
              <th className="px-4 py-3 text-start">Product</th>
              <th className="px-4 py-3 text-end">On Hand</th>
              <th className="px-4 py-3 text-end">Reserved</th>
              <th className="px-4 py-3 text-end">Available</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isLow = row.available <= row.lowStockThreshold;
              return (
                <tr key={`${row.productId}:${row.variantId ?? ""}`} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{row.productNameEn}</p>
                    {row.variantNameEn && <p className="text-xs text-muted">{row.variantNameEn}</p>}
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
                      label={row.variantNameEn ? `${row.productNameEn} — ${row.variantNameEn}` : row.productNameEn}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-lg font-bold">Recent movements</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-bold uppercase text-muted">
              <th className="px-4 py-3 text-start">Product</th>
              <th className="px-4 py-3 text-start">Reason</th>
              <th className="px-4 py-3 text-end">Qty</th>
              <th className="px-4 py-3 text-start">Date</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  {m.productName}
                  {m.variantName && <span className="text-muted"> — {m.variantName}</span>}
                </td>
                <td className="px-4 py-3 capitalize text-muted">{m.reason.replace("-", " ")}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
