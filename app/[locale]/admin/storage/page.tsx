import { HardDrive } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getStorageOverview, getOrphanedProductImages, getStaleAttachments } from "@/lib/data/storage";
import { OrphanedImagesPanel, StaleAttachmentsPanel } from "@/components/admin/storage-cleanup";
import { formatBytes } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminStoragePage() {
  const t = await getTranslations("admin.storage");
  const [overview, orphanedImages, stale] = await Promise.all([
    getStorageOverview(),
    getOrphanedProductImages(),
    getStaleAttachments(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">{t("stats.total")}</p>
            <HardDrive className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-extrabold">{formatBytes(overview.totalBytes)}</p>
          <p className="mt-1 text-xs text-muted">{t("stats.fileCount", { count: overview.totalCount })}</p>
        </div>
        {overview.byPrefix.map((p) => (
          <div key={p.prefix} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold capitalize text-muted">{p.prefix.replace(/-/g, " ")}</p>
            <p className="mt-2 text-2xl font-extrabold">{formatBytes(p.bytes)}</p>
            <p className="mt-1 text-xs text-muted">{t("stats.fileCount", { count: p.count })}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-bold">{t("orphanedImages")}</h2>
      <p className="mt-1 text-sm text-muted">{t("orphanedImagesHint")}</p>
      <div className="mt-4">
        <OrphanedImagesPanel images={orphanedImages} />
      </div>

      <h2 className="mt-10 text-lg font-bold">{t("staleScreenshots")}</h2>
      <p className="mt-1 text-sm text-muted">{t("staleHint")}</p>
      <div className="mt-4">
        <StaleAttachmentsPanel ownerLabel={t("table.order")} items={stale.paymentScreenshots} />
      </div>

      <h2 className="mt-10 text-lg font-bold">{t("staleAttachments")}</h2>
      <p className="mt-1 text-sm text-muted">{t("staleHint")}</p>
      <div className="mt-4">
        <StaleAttachmentsPanel ownerLabel={t("table.request")} items={stale.requestAttachments} />
      </div>
    </div>
  );
}
