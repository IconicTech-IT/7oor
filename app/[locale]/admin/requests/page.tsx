import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllRequestsAdmin } from "@/lib/data/admin-requests";
import { DateRangeFilter } from "@/components/admin/date-range-filter";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  in_review: "bg-warning/10 text-warning",
  quoted: "bg-primary/10 text-primary",
  accepted: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
  completed: "bg-success/10 text-success",
};

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;
  const requests = await getAllRequestsAdmin(from, to);
  const t = await getTranslations("admin.requests");
  const tStatus = await getTranslations("requests.status");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>

      <DateRangeFilter from={from} to={to} />

      <div className="mt-6 flex flex-col gap-3">
        {requests.length === 0 && <p className="py-16 text-center text-muted">{t("empty")}</p>}
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
                {tStatus(r.status as "new")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
