import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategoryTree, getCategoryIdsForSlug } from "@/lib/data/categories";
import { getProducts, getProductsCount } from "@/lib/data/products";
import { getAvailabilityMap, getCardAvailability } from "@/lib/data/availability";
import { ProductsFilterBar } from "@/components/products/products-filter-bar";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductCard } from "@/components/products/product-card";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

type SearchParams = Promise<{ category?: string; min?: string; max?: string; q?: string; page?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const t = await getTranslations("products");

  const categories = await getCategoryTree();
  const categoryIds = sp.category ? await getCategoryIdsForSlug(sp.category) : undefined;
  const minPrice = sp.min ? Number(sp.min) : undefined;
  const maxPrice = sp.max ? Number(sp.max) : undefined;
  const search = sp.q;

  const total = await getProductsCount({ categoryIds, minPrice, maxPrice, search });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = sp.page ? Number(sp.page) : 1;
  const page = Math.min(Math.max(1, Number.isFinite(requestedPage) ? requestedPage : 1), totalPages);

  const [products, availabilityMap] = await Promise.all([
    getProducts({
      categoryIds,
      minPrice,
      maxPrice,
      search,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    getAvailabilityMap(),
  ]);
  const gridKey = `${sp.category ?? "all"}-${sp.min ?? ""}-${sp.max ?? ""}-${sp.q ?? ""}-${page}`;

  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (sp.category) params.set("category", sp.category);
    if (sp.min) params.set("min", sp.min);
    if (sp.max) params.set("max", sp.max);
    if (sp.q) params.set("q", sp.q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold">{t("title")}</h1>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <ProductsFilterBar
          categories={categories}
          selectedCategory={sp.category}
          minPrice={sp.min}
          maxPrice={sp.max}
          searchQuery={sp.q}
        />
        <div className="flex-1">
          {products.length === 0 ? (
            <p className="py-24 text-center text-muted">{t("noResults")}</p>
          ) : (
            <>
              <ProductGrid key={gridKey}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    availableQty={getCardAvailability(availabilityMap, product)}
                  />
                ))}
              </ProductGrid>

              <div className="mt-8 flex items-center justify-center gap-4">
                {page > 1 ? (
                  <Link
                    href={pageHref(page - 1)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-primary"
                  >
                    {t("pagination.previous")}
                  </Link>
                ) : (
                  <span className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted opacity-50">
                    {t("pagination.previous")}
                  </span>
                )}
                <span className="text-sm text-muted">{t("pagination.pageOf", { page, total: totalPages })}</span>
                {page < totalPages ? (
                  <Link
                    href={pageHref(page + 1)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-primary"
                  >
                    {t("pagination.next")}
                  </Link>
                ) : (
                  <span className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted opacity-50">
                    {t("pagination.next")}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
