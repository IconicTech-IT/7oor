import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithRelations } from "@/lib/types";

export async function FeaturedSection({ products }: { products: ProductWithRelations[] }) {
  const t = await getTranslations("home.featured");

  return (
    <div className="flex h-full w-full items-center bg-card">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-aos="fade-up" className="mb-8 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-primary">
              {t("eyebrow")}
            </span>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{t("title")}</h2>
          </div>
          <Link
            href="/products"
            className="hidden text-sm font-bold text-primary hover:underline sm:block"
          >
            {t("viewAll")} →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} aos="fade-up" />
          ))}
        </div>
      </div>
    </div>
  );
}
