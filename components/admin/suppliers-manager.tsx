"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { deleteSupplierAction } from "@/lib/actions/suppliers";
import { SupplierForm } from "./supplier-form";
import type { Supplier } from "@/lib/types";

export function SuppliersManager({ suppliers }: { suppliers: Supplier[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const t = useTranslations("admin.purchases");
  const tCommon = useTranslations("common");

  async function handleDelete(id: string) {
    if (!confirm(t("supplierForm.deleteConfirm"))) return;
    const result = await deleteSupplierAction(id);
    if (result.error) toast.error(result.error);
    else toast.success(t("supplierForm.toastDeleted"));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        {showNew ? (
          <div className="rounded-2xl border border-border bg-card p-4">
            <SupplierForm onDone={() => setShowNew(false)} />
          </div>
        ) : (
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            {t("supplierForm.addSupplier")}
          </button>
        )}
      </div>

      {suppliers.length === 0 ? (
        <p className="text-sm text-muted">{t("supplierForm.empty")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {suppliers.map((supplier) =>
            editingId === supplier.id ? (
              <div key={supplier.id} className="rounded-2xl border border-border bg-card p-4">
                <SupplierForm initial={supplier} onDone={() => setEditingId(null)} />
              </div>
            ) : (
              <div
                key={supplier.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-semibold">{supplier.name}</p>
                  <p className="text-xs text-muted">
                    {[supplier.phone, supplier.email, supplier.address].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingId(supplier.id)}
                    className="rounded-lg p-2 hover:bg-foreground/5"
                    aria-label={tCommon("edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="rounded-lg p-2 text-danger hover:bg-danger/10"
                    aria-label={tCommon("delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
