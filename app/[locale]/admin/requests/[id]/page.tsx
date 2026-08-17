import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getRequestDetailAdmin } from "@/lib/data/admin-requests";
import { RequestStatusForm } from "@/components/admin/request-status-form";
import { RequestAttachmentViewer } from "@/components/admin/request-attachment-viewer";

export const dynamic = "force-dynamic";

const FULFILLMENT_KEY: Record<string, "pickup" | "delivery"> = {
  pickup: "pickup",
  delivery: "delivery",
};

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getRequestDetailAdmin(id);
  if (!request) notFound();

  const t = await getTranslations("admin.requests");
  const tCheckout = await getTranslations("checkout");

  const fulfillmentKey = request.fulfillment_method ? FULFILLMENT_KEY[request.fulfillment_method] : undefined;
  const fulfillmentLabel = fulfillmentKey
    ? tCheckout(fulfillmentKey)
    : (request.fulfillment_method ?? "—");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold">{request.name}</h1>
      <p className="text-sm text-muted">
        {new Date(request.created_at).toLocaleString("en-GB")}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">{t("detail.contact")}</p>
          <p className="mt-1 font-semibold">{request.contact}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">{t("detail.customerAccount")}</p>
          <p className="mt-1 font-semibold">{request.customer?.full_name ?? "—"}</p>
          <p className="text-sm text-muted">{request.customer?.phone ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">{t("detail.category")}</p>
          <p className="mt-1 font-semibold">{request.category || "—"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">{t("detail.qtyBudget")}</p>
          <p className="mt-1 font-semibold">{request.qty_or_budget || "—"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 sm:col-span-2">
          <p className="text-xs font-bold uppercase text-muted">{t("detail.fulfillment")}</p>
          <p className="mt-1 font-semibold capitalize">
            {fulfillmentLabel}
            {request.delivery_address ? ` — ${request.delivery_address}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-bold uppercase text-muted">{t("detail.description")}</p>
        <p className="mt-2 whitespace-pre-line text-sm">{request.description}</p>
        {request.attachment_url && (
          <div className="mt-3">
            <RequestAttachmentViewer path={request.attachment_url} />
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-bold">{t("detail.updateStatus")}</h2>
        <RequestStatusForm
          requestId={request.id}
          status={request.status}
          adminNotes={request.admin_notes}
        />
      </div>
    </div>
  );
}
