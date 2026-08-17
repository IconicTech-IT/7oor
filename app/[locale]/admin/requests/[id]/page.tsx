import { notFound } from "next/navigation";
import { getRequestDetailAdmin } from "@/lib/data/admin-requests";
import { RequestStatusForm } from "@/components/admin/request-status-form";
import { RequestAttachmentViewer } from "@/components/admin/request-attachment-viewer";

export const dynamic = "force-dynamic";

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getRequestDetailAdmin(id);
  if (!request) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold">{request.name}</h1>
      <p className="text-sm text-muted">
        {new Date(request.created_at).toLocaleString("en-GB")}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">Contact</p>
          <p className="mt-1 font-semibold">{request.contact}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">Customer account</p>
          <p className="mt-1 font-semibold">{request.customer?.full_name ?? "—"}</p>
          <p className="text-sm text-muted">{request.customer?.phone ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">Category</p>
          <p className="mt-1 font-semibold">{request.category || "—"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold uppercase text-muted">Qty / Budget</p>
          <p className="mt-1 font-semibold">{request.qty_or_budget || "—"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 sm:col-span-2">
          <p className="text-xs font-bold uppercase text-muted">Fulfillment</p>
          <p className="mt-1 font-semibold capitalize">
            {request.fulfillment_method ?? "—"}
            {request.delivery_address ? ` — ${request.delivery_address}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-bold uppercase text-muted">Description</p>
        <p className="mt-2 whitespace-pre-line text-sm">{request.description}</p>
        {request.attachment_url && (
          <div className="mt-3">
            <RequestAttachmentViewer path={request.attachment_url} />
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-bold">Update status</h2>
        <RequestStatusForm
          requestId={request.id}
          status={request.status}
          adminNotes={request.admin_notes}
        />
      </div>
    </div>
  );
}
