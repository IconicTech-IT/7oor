import { getTranslations } from "next-intl/server";
import { getCategoryTree, getCategoryIdsForSlug } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { getAvailabilityMap, getCardAvailability } from "@/lib/data/availability";
import { ProductsFilterBar } from "@/components/products/products-filter-bar";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductCard } from "@/components/products/product-card";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ category?: string; min?: string; max?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const t = await getTranslations("products");

  const categories = await getCategoryTree();
  const categoryIds = sp.category ? await getCategoryIdsForSlug(sp.category) : undefined;
  const minPrice = sp.min ? Number(sp.min) : undefined;
  const maxPrice = sp.max ? Number(sp.max) : undefined;
  const [products, availabilityMap] = await Promise.all([
    getProducts({ categoryIds, minPrice, maxPrice }),
    getAvailabilityMap(),
  ]);
  const gridKey = `${sp.category ?? "all"}-${sp.min ?? ""}-${sp.max ?? ""}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold">{t("title")}</h1>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <ProductsFilterBar
          categories={categories}
          selectedCategory={sp.category}
          minPrice={sp.min}
          maxPrice={sp.max}
        />
        <div className="flex-1">
          {products.length === 0 ? (
            <p className="py-24 text-center text-muted">{t("noResults")}</p>
          ) : (
            <ProductGrid key={gridKey}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  availableQty={getCardAvailability(availabilityMap, product)}
                />
              ))}
            </ProductGrid>
          )}
        </div>
      </div>
    </div>
  );
}
