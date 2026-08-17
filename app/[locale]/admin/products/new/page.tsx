import { getAllCategoriesFlat } from "@/lib/data/categories";
import { getAllProductsAdmin } from "@/lib/data/products";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, allProducts] = await Promise.all([
    getAllCategoriesFlat(),
    getAllProductsAdmin(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">New Product</h1>
      <div className="mt-6">
        <ProductForm categories={categories} allProducts={allProducts} />
      </div>
    </div>
  );
}
