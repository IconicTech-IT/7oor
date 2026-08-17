"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { confirmOrderAction, markOrderDoneAction, cancelOrderAction } from "@/lib/actions/admin-orders";

export function OrderStatusActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const t = useTranslations("admin.orders");
  const tCommon = useTranslations("common");

  async function run(action: "confirm" | "done" | "cancel") {
    setLoading(action);
    const fn =
      action === "confirm" ? confirmOrderAction : action === "done" ? markOrderDoneAction : cancelOrderAction;
    const result = await fn(orderId);
    if (result.error) toast.error(result.error);
    else {
      toast.success(t("toastUpdated"));
      router.refresh();
    }
    setLoading(null);
  }

  if (status === "done" || status === "cancelled") return null;

  return (
    <div className="flex gap-2">
      {status === "new" && (
        <button
          onClick={() => run("confirm")}
          disabled={loading !== null}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {loading === "confirm" ? t("actions.confirming") : t("actions.confirmOrder")}
        </button>
      )}
      {(status === "new" || status === "confirmed") && (
        <button
          onClick={() => run("done")}
          disabled={loading !== null}
          className="rounded-full bg-success px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading === "done" ? t("actions.completing") : t("actions.markDone")}
        </button>
      )}
      <button
        onClick={() => run("cancel")}
        disabled={loading !== null}
        className="rounded-full border border-danger/40 px-5 py-2.5 text-sm font-bold text-danger hover:bg-danger/10 disabled:opacity-60"
      >
        {loading === "cancel" ? t("actions.cancelling") : tCommon("cancel")}
      </button>
    </div>
  );
}
