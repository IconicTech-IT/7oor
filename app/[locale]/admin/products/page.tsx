import Image from "next/image";
import { ImageOff, Plus } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllProductsAdmin } from "@/lib/data/products";
import { formatEGP } from "@/lib/currency";
import { localized } from "@/lib/types";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();
  const t = await getTranslations("admin.products");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{t("title")}</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          {t("addProduct")}
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-start text-xs font-bold uppercase text-muted">
              <th className="px-4 py-3 text-start">{t("table.product")}</th>
              <th className="px-4 py-3 text-start">{t("table.type")}</th>
              <th className="px-4 py-3 text-start">{t("table.category")}</th>
              <th className="px-4 py-3 text-start">{t("table.price")}</th>
              <th className="px-4 py-3 text-start">{t("table.status")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-background">
                      {p.image_url ? (
                        <Image src={p.image_url} alt="" fill sizes="40px" className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-2">
                          <ImageOff className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{p.name_en}</p>
                      <p className="text-xs text-muted">{p.name_ar}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize text-muted">{p.type}</td>
                <td className="px-4 py-3 text-muted">
                  {p.category ? localized(locale, p.category.name_ar, p.category.name_en) : "—"}
                </td>
                <td className="px-4 py-3 font-semibold">{formatEGP(p.price, "en")}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      p.is_active ? "bg-success/10 text-success" : "bg-muted/10 text-muted"
                    }`}
                  >
                    {p.is_active ? t("status.active") : t("status.hidden")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:border-primary"
                    >
                      {tCommon("edit")}
                    </Link>
                    <DeleteProductButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
