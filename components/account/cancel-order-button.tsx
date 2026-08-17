"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { cancelOwnOrderAction } from "@/lib/actions/customer-orders";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const t = useTranslations("account");
  const router = useRouter();

  async function handleCancel() {
    if (!confirm(t("cancelOrderConfirm"))) return;
    const result = await cancelOwnOrderAction(orderId);
    if (result.error) toast.error(t("cancelOrderError"));
    else {
      toast.success(t("orderCancelled"));
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleCancel}
      className="mt-4 rounded-full border border-danger/30 px-4 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
    >
      {t("cancelOrder")}
    </button>
  );
}
