import { Link } from "@/i18n/navigation";
import { getAllRequestsAdmin } from "@/lib/data/admin-requests";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  in_review: "bg-warning/10 text-warning",
  quoted: "bg-primary/10 text-primary",
  accepted: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
  completed: "bg-success/10 text-success",
};

export default async function AdminRequestsPage() {
  const requests = await getAllRequestsAdmin();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Requests</h1>
      <p className="mt-1 text-sm text-muted">Custom items, bulk orders, and special jobs.</p>

      <div className="mt-6 flex flex-col gap-3">
        {requests.length === 0 && <p className="py-16 text-center text-muted">No requests yet.</p>}
        {requests.map((r) => (
          <Link
            key={r.id}
            href={`/admin/requests/${r.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary"
          >
            <div className="min-w-0">
              <p className="font-bold">{r.name}</p>
              <p className="line-clamp-1 text-xs text-muted">{r.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">
                {new Date(r.created_at).toLocaleDateString("en-GB")}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  STATUS_COLORS[r.status] ?? ""
                }`}
              >
                {r.status.replace("_", " ")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
