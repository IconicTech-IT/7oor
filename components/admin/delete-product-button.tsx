"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { deleteProductAction } from "@/lib/actions/products";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const result = await deleteProductAction(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Product deleted");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg border border-danger/30 p-2 text-danger hover:bg-danger/10"
      aria-label="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
