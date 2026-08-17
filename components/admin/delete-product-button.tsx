"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { deleteProductAction } from "@/lib/actions/products";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations("admin.products");
  const tCommon = useTranslations("common");

  async function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;
    const result = await deleteProductAction(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success(t("toastDeleted"));
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg border border-danger/30 p-2 text-danger hover:bg-danger/10"
      aria-label={tCommon("delete")}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
