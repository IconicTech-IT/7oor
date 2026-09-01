"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { deleteStorageObjectsAction } from "@/lib/actions/admin-storage";
import { formatBytes } from "@/lib/format";

type OrphanedImage = { key: string; url: string; size: number; lastModified: string };
type StaleAttachment = { key: string; size: number; lastModified: string; ownerLabel: string; closedAt: string };

function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll(keys: string[]) {
    setSelected((prev) => (prev.size === keys.length ? new Set() : new Set(keys)));
  }

  function clear() {
    setSelected(new Set());
  }

  return { selected, toggle, toggleAll, clear };
}

function useDeleteSelected(clear: () => void) {
  const router = useRouter();
  const t = useTranslations("admin.storage");
  const [deleting, setDeleting] = useState(false);

  async function deleteKeys(keys: string[]) {
    if (keys.length === 0) return;
    if (!confirm(t("deleteConfirm", { count: keys.length }))) return;
    setDeleting(true);
    const result = await deleteStorageObjectsAction(keys);
    setDeleting(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(t("deleted", { count: result.deletedCount ?? 0 }));
      clear();
      router.refresh();
    }
  }

  return { deleting, deleteKeys };
}

function SelectionBar({
  total,
  selectedCount,
  onToggleAll,
  onDelete,
  deleting,
}: {
  total: number;
  selectedCount: number;
  onToggleAll: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const t = useTranslations("admin.storage");
  return (
    <div className="mb-3 flex items-center justify-between">
      <button type="button" onClick={onToggleAll} className="text-xs font-semibold text-primary hover:underline">
        {selectedCount === total ? t("deselectAll") : t("selectAll")}
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={selectedCount === 0 || deleting}
        className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/10 disabled:opacity-40"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {t("deleteSelected", { count: selectedCount })}
      </button>
    </div>
  );
}

export function OrphanedImagesPanel({ images }: { images: OrphanedImage[] }) {
  const t = useTranslations("admin.storage");
  const { selected, toggle, toggleAll, clear } = useSelection();
  const { deleting, deleteKeys } = useDeleteSelected(clear);

  if (images.length === 0) {
    return <p className="text-sm text-muted">{t("noOrphanedImages")}</p>;
  }

  return (
    <div>
      <SelectionBar
        total={images.length}
        selectedCount={selected.size}
        onToggleAll={() => toggleAll(images.map((i) => i.key))}
        onDelete={() => deleteKeys(Array.from(selected))}
        deleting={deleting}
      />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {images.map((img) => (
          <label
            key={img.key}
            className={`group relative block cursor-pointer overflow-hidden rounded-xl border-2 ${
              selected.has(img.key) ? "border-danger" : "border-border"
            }`}
          >
            <input
              type="checkbox"
              className="absolute start-1.5 top-1.5 z-10 h-4 w-4"
              checked={selected.has(img.key)}
              onChange={() => toggle(img.key)}
            />
            <div className="relative aspect-square w-full bg-background">
              {img.url ? (
                <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-2">
                  <ImageOff className="h-5 w-5" />
                </div>
              )}
            </div>
            <p className="truncate bg-card px-1.5 py-1 text-[10px] text-muted">{formatBytes(img.size)}</p>
          </label>
        ))}
      </div>
    </div>
  );
}

export function StaleAttachmentsPanel({ ownerLabel, items }: { ownerLabel: string; items: StaleAttachment[] }) {
  const t = useTranslations("admin.storage");
  const { selected, toggle, toggleAll, clear } = useSelection();
  const { deleting, deleteKeys } = useDeleteSelected(clear);

  if (items.length === 0) {
    return <p className="text-sm text-muted">{t("noStaleFiles")}</p>;
  }

  return (
    <div>
      <SelectionBar
        total={items.length}
        selectedCount={selected.size}
        onToggleAll={() => toggleAll(items.map((i) => i.key))}
        onDelete={() => deleteKeys(Array.from(selected))}
        deleting={deleting}
      />
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-bold uppercase text-muted">
              <th className="px-3 py-2" />
              <th className="px-3 py-2 text-start">{ownerLabel}</th>
              <th className="px-3 py-2 text-end">{t("table.size")}</th>
              <th className="px-3 py-2 text-start">{t("table.closedAt")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.key} className="border-b border-border last:border-0">
                <td className="px-3 py-2">
                  <input type="checkbox" checked={selected.has(item.key)} onChange={() => toggle(item.key)} />
                </td>
                <td className="px-3 py-2 font-semibold">{item.ownerLabel}</td>
                <td className="px-3 py-2 text-end text-muted">{formatBytes(item.size)}</td>
                <td className="px-3 py-2 text-muted">{new Date(item.closedAt).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

