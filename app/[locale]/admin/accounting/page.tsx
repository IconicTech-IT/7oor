import { AlertTriangle } from "lucide-react";
import {
  getInvoices,
  getBills,
  getLedgerEntries,
  getReportSummary,
  getTopSellingProducts,
} from "@/lib/data/accounting";
import { getInventoryOverview } from "@/lib/data/inventory";
import { formatEGP } from "@/lib/currency";

export const dynamic = "force-dynamic";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p
        className={`mt-1 text-2xl font-extrabold ${
          tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default async function AdminAccountingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const from = sp.from || startOfMonth();
  const to = sp.to || today();

  const [summary, topProducts, invoices, bills, ledger, inventory] = await Promise.all([
    getReportSummary(from, `${to}T23:59:59`),
    getTopSellingProducts(from, `${to}T23:59:59`),
    getInvoices(),
    getBills(),
    getLedgerEntries(60),
    getInventoryOverview(),
  ]);

  const lowStock = inventory.filter((r) => r.available <= r.lowStockThreshold);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Accounting</h1>

      <form className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">From</label>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">To</label>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
        >
          Apply
        </button>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Revenue" value={formatEGP(summary.revenue, "en")} />
        <StatCard label="COGS" value={formatEGP(summary.cogs, "en")} />
        <StatCard label="Gross Profit" value={formatEGP(summary.grossProfit, "en")} tone="success" />
        <StatCard label="Expenses" value={formatEGP(summary.expenses, "en")} />
        <StatCard
          label="Net Profit"
          value={formatEGP(summary.netProfit, "en")}
          tone={summary.netProfit >= 0 ? "success" : "danger"}
        />
      </div>

      <h2 className="mt-10 text-lg font-bold">Top selling products</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-bold uppercase text-muted">
              <th className="px-4 py-3 text-start">Product</th>
              <th className="px-4 py-3 text-end">Qty sold</th>
              <th className="px-4 py-3 text-end">Revenue</th>
              <th className="px-4 py-3 text-end">Margin</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  No completed sales in this range.
                </td>
              </tr>
            )}
            {topProducts.map((p) => (
              <tr key={p.productId} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-semibold">{p.name}</td>
                <td className="px-4 py-3 text-end">{p.qtySold}</td>
                <td className="px-4 py-3 text-end">{formatEGP(p.revenue, "en")}</td>
                <td className="px-4 py-3 text-end font-semibold text-success">
                  {formatEGP(p.margin, "en")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lowStock.length > 0 && (
        <>
          <h2 className="mt-10 flex items-center gap-2 text-lg font-bold">
            <AlertTriangle className="h-5 w-5 text-danger" /> Low stock
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-bold uppercase text-muted">
                  <th className="px-4 py-3 text-start">Product</th>
                  <th className="px-4 py-3 text-end">Available</th>
                  <th className="px-4 py-3 text-end">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((row) => (
                  <tr key={`${row.productId}:${row.variantId ?? ""}`} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      {row.productNameEn}
                      {row.variantNameEn && <span className="text-muted"> — {row.variantNameEn}</span>}
                    </td>
                    <td className="px-4 py-3 text-end font-bold text-danger">{row.available}</td>
                    <td className="px-4 py-3 text-end text-muted">{row.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold">Invoices</h2>
          <div className="mt-4 flex flex-col gap-2">
            {invoices.slice(0, 15).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{inv.invoice_number}</p>
                  <p className="text-xs text-muted">{inv.sales_order?.order_number}</p>
                </div>
                <div className="text-end">
                  <p className="font-bold">{formatEGP(inv.sales_order?.total ?? 0, "en")}</p>
                  <p
                    className={`text-xs font-bold capitalize ${
                      inv.status === "paid" ? "text-success" : "text-warning"
                    }`}
                  >
                    {inv.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold">Bills (purchases)</h2>
          <div className="mt-4 flex flex-col gap-2">
            {bills.slice(0, 15).map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-sm"
              >
                <p>{bill.description}</p>
                <p className="font-bold text-danger">-{formatEGP(bill.amount, "en")}</p>
              </div>
            ))}
            {bills.length === 0 && <p className="text-sm text-muted">No bills recorded yet.</p>}
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-bold">Ledger</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-bold uppercase text-muted">
              <th className="px-4 py-3 text-start">Date</th>
              <th className="px-4 py-3 text-start">Type</th>
              <th className="px-4 py-3 text-start">Description</th>
              <th className="px-4 py-3 text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((entry) => (
              <tr key={entry.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-xs text-muted">
                  {new Date(entry.entry_date).toLocaleDateString("en-GB")}
                </td>
                <td className="px-4 py-3 capitalize">{entry.type}</td>
                <td className="px-4 py-3">{entry.description}</td>
                <td
                  className={`px-4 py-3 text-end font-semibold ${
                    entry.type === "revenue" ? "text-success" : "text-danger"
                  }`}
                >
                  {entry.type === "revenue" ? "+" : "-"}
                  {formatEGP(entry.amount, "en")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
