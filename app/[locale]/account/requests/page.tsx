import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  in_review: "bg-warning/10 text-warning",
  quoted: "bg-primary/10 text-primary",
  accepted: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
  completed: "bg-success/10 text-success",
};

export default async function AccountRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: requests } = await supabase
    .from("requests")
    .select("*")
    .eq("customer_id", user!.id)
    .order("created_at", { ascending: false });

  const t = await getTranslations("account");
  const tStatus = await getTranslations("requests.status");
  const locale = await getLocale();

  if (!requests || requests.length === 0) {
    return <p className="py-16 text-center text-muted">{t("noRequests")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((r) => (
        <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold">{r.category || "—"}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{r.description}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[r.status] ?? ""}`}
            >
              {tStatus(r.status)}
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">
            {new Date(r.created_at).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-EG")}
          </p>
        </div>
      ))}
    </div>
  );
}
