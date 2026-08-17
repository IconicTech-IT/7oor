"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { markPurchaseOrderedAction, receivePurchaseOrderAction } from "@/lib/actions/purchases";

export function PurchaseOrderActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const t = useTranslations("admin.purchases");

  async function handleMarkOrdered() {
    setLoading(true);
    const result = await markPurchaseOrderedAction(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success(t("toastMarkedOrdered"));
      router.refresh();
    }
    setLoading(false);
  }

  async function handleReceive() {
    if (!confirm(t("receiveConfirm"))) return;
    setLoading(true);
    const result = await receivePurchaseOrderAction(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success(t("toastReceived"));
      router.refresh();
    }
    setLoading(false);
  }

  if (status === "received") return null;

  return (
    <div className="flex gap-2">
      {status === "draft" && (
        <button
          onClick={handleMarkOrdered}
          disabled={loading}
          className="rounded-full bg-warning px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          {t("actions.markOrdered")}
        </button>
      )}
      {(status === "draft" || status === "ordered") && (
        <button
          onClick={handleReceive}
          disabled={loading}
          className="rounded-full bg-success px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          {t("actions.receive")}
        </button>
      )}
    </div>
  );
}
