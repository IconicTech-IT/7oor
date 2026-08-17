import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAllPurchaseOrders } from "@/lib/data/purchases";
import { formatEGP } from "@/lib/currency";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted/10 text-muted",
  ordered: "bg-warning/10 text-warning",
  received: "bg-success/10 text-success",
};

export default async function AdminPurchasesPage() {
  const orders = await getAllPurchaseOrders();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Purchases</h1>
        <Link
          href="/admin/purchases/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          New purchase order
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {orders.length === 0 && <p className="py-16 text-center text-muted">No purchase orders yet.</p>}
        {orders.map((po) => {
          const total = po.items.reduce((sum, i) => sum + i.qty_ordered * i.unit_cost, 0);
          return (
            <Link
              key={po.id}
              href={`/admin/purchases/${po.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <div>
                <p className="font-bold">{po.po_number}</p>
                <p className="text-xs text-muted">
                  {po.supplier?.name ?? "—"} · {po.items.length} item{po.items.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-primary">{formatEGP(total, "en")}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    STATUS_COLORS[po.status] ?? ""
                  }`}
                >
                  {po.status}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
