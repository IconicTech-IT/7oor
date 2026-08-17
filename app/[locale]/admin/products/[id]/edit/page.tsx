import { notFound } from "next/navigation";
import { getAllCategoriesFlat } from "@/lib/data/categories";
import { getAllProductsAdmin, getProductByIdAdmin } from "@/lib/data/products";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, allProducts, product] = await Promise.all([
    getAllCategoriesFlat(),
    getAllProductsAdmin(),
    getProductByIdAdmin(id),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Edit Product</h1>
      <div className="mt-6">
        <ProductForm categories={categories} allProducts={allProducts} initial={product} />
      </div>
    </div>
  );
}
