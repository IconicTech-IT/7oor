import { getTranslations } from "next-intl/server";
import { getCategoryTree } from "@/lib/data/categories";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategoryTree();
  const t = await getTranslations("admin.categories");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-6">
        <CategoriesManager categories={categories} />
      </div>
    </div>
  );
}
