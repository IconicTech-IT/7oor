import { getCategoryTree } from "@/lib/data/categories";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategoryTree();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Categories</h1>
      <p className="mt-1 text-sm text-muted">
        Manage top-level categories and their sub-categories.
      </p>
      <div className="mt-6">
        <CategoriesManager categories={categories} />
      </div>
    </div>
  );
}
