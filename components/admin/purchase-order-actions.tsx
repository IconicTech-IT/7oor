"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { markPurchaseOrderedAction, receivePurchaseOrderAction } from "@/lib/actions/purchases";

export function PurchaseOrderActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkOrdered() {
    setLoading(true);
    const result = await markPurchaseOrderedAction(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Marked as ordered");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleReceive() {
    if (!confirm("Receive this order? This creates stock lots at the recorded unit cost.")) return;
    setLoading(true);
    const result = await receivePurchaseOrderAction(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Purchase order received — stock updated");
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
          Mark as Ordered
        </button>
      )}
      {(status === "draft" || status === "ordered") && (
        <button
          onClick={handleReceive}
          disabled={loading}
          className="rounded-full bg-success px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
        >
          Receive
        </button>
      )}
    </div>
  );
}
