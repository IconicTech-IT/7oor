import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import {
  getAvailabilityMap,
  getCardAvailability,
  getVariantAvailabilityRecord,
} from "@/lib/data/availability";
import { ProductDetailClient } from "@/components/products/product-detail-client";
import { ProductCard } from "@/components/products/product-card";
import { localized } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const locale = await getLocale();
  const t = await getTranslations("products");
  const [related, availabilityMap] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getAvailabilityMap(),
  ]);

  const fullDescription = localized(locale, product.description_ar, product.description_en);
  const availability = getVariantAvailabilityRecord(availabilityMap, product);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ProductDetailClient
        product={{
          id: product.id,
          slug: product.slug,
          type: product.type,
          pricingUnit: product.pricing_unit,
          nameAr: product.name_ar,
          nameEn: product.name_en,
          price: product.price,
          imageUrl: product.image_url,
          variants: product.variants.map((v) => ({
            id: v.id,
            nameAr: v.name_ar,
            nameEn: v.name_en,
            price: v.price,
            imageUrl: v.image_url,
            colorHex: v.color_hex,
          })),
        }}
        availability={availability}
      />

      {fullDescription && (
        <div className="mt-12 max-w-3xl">
          <h2 className="text-lg font-bold">{locale === "ar" ? "الوصف" : "Description"}</h2>
          <p className="mt-3 whitespace-pre-line text-muted">{fullDescription}</p>
        </div>
      )}

      {product.type === "combo" && product.combo_components.length > 0 && (
        <div className="mt-8 max-w-3xl rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold">{locale === "ar" ? "يشمل العرض" : "Bundle includes"}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {product.combo_components.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span>
                  {c.qty}× {localized(locale, c.component_product?.name_ar ?? null, c.component_product?.name_en ?? null)}
                  {c.component_variant && (
                    <span className="text-muted">
                      {" "}
                      — {localized(locale, c.component_variant.name_ar, c.component_variant.name_en)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-extrabold">{t("relatedProducts")}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} availableQty={getCardAvailability(availabilityMap, p)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
