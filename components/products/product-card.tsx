import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ImageOff } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatEGP } from "@/lib/currency";
import { localized } from "@/lib/types";
import type { ProductWithRelations } from "@/lib/types";

export async function ProductCard({
  product,
  aos,
}: {
  product: ProductWithRelations;
  aos?: string;
}) {
  const locale = await getLocale();
  const t = await getTranslations("products");
  const name = localized(locale, product.name_ar, product.name_en);
  const shortDesc = localized(locale, product.short_description_ar, product.short_description_en);

  const prices = product.variants.length
    ? product.variants.map((v) => v.price ?? product.price)
    : [product.price];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const isJob = product.pricing_unit === "job";
  const isCustom = product.type === "custom_request";

  return (
    <Link
      href={`/products/${product.slug}`}
      data-aos={aos}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-background">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-2">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        {product.type === "combo" && (
          <span className="absolute start-2 top-2 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
            {locale === "ar" ? "عرض" : "Bundle"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 text-sm font-bold text-foreground">{name}</h3>
        <p className="line-clamp-2 flex-1 text-xs text-muted">{shortDesc}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-extrabold text-primary">
            {minPrice !== maxPrice ? `${formatEGP(minPrice, locale)}+` : formatEGP(minPrice, locale)}
            {isJob && <span className="ms-1 text-xs font-normal text-muted">/{locale === "ar" ? "صفحة" : "pg"}</span>}
          </span>
          <span className="text-xs font-semibold text-primary group-hover:underline">
            {isCustom ? t("customService") : t("viewDetails")}
          </span>
        </div>
      </div>
    </Link>
  );
}
