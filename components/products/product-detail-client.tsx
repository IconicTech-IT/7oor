"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ImageOff, Minus, Plus, ShoppingBag } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useCartStore } from "@/lib/store/cart";
import { formatEGP } from "@/lib/currency";
import { fade } from "@/lib/motion";
import { CUSTOM_WRITING_SLUG } from "@/lib/constants";

export type VariantData = {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number | null;
  imageUrl: string | null;
  colorHex: string | null;
};

export type ProductDetailData = {
  id: string;
  slug: string;
  type: string;
  pricingUnit: string;
  nameAr: string;
  nameEn: string;
  price: number;
  imageUrl: string | null;
  variants: VariantData[];
};

type Props = {
  product: ProductDetailData;
  /** Keyed by variant id, "" for the base product — see lib/data/availability.ts. */
  availability: Record<string, number>;
};

export function ProductDetailClient({ product, availability }: Props) {
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("products");
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id ?? null,
  );
  const [qty, setQty] = useState(1);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product.variants, selectedVariantId],
  );

  const displayImage = selectedVariant?.imageUrl ?? product.imageUrl;
  const displayPrice = selectedVariant?.price ?? product.price;
  const isCustomRequest = product.type === "custom_request" || product.slug === CUSTOM_WRITING_SLUG;
  const currentAvailable = availability[selectedVariantId ?? ""] ?? 0;
  const isOutOfStock = !isCustomRequest && currentAvailable <= 0;

  function handleAddToCart() {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      slug: product.slug,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      variantNameAr: selectedVariant?.nameAr,
      variantNameEn: selectedVariant?.nameEn,
      price: displayPrice,
      image: displayImage,
      qty,
    });
    toast.success(locale === "ar" ? "تمت الإضافة للسلة" : "Added to cart");
  }

  function handleRequestService() {
    router.push(`/requests?product=${encodeURIComponent(product.slug)}`);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayImage ?? "placeholder"}
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            {displayImage ? (
              <Image
                src={displayImage}
                alt=""
                fill
                sizes="50vw"
                className={`object-cover ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-2">
                <ImageOff className="h-16 w-16" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {isOutOfStock && (
          <span className="absolute start-3 top-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-bold text-background">
            {t("outOfStock")}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <h1 className="text-3xl font-extrabold">{locale === "ar" ? product.nameAr : product.nameEn}</h1>

        <AnimatePresence mode="wait">
          <motion.div
            key={displayPrice}
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="text-2xl font-extrabold text-primary"
          >
            {formatEGP(displayPrice, locale)}
            {product.pricingUnit === "page" && (
              <span className="ms-1.5 text-sm font-normal text-muted">
                /{locale === "ar" ? "صفحة" : "page"}
              </span>
            )}
          </motion.div>
        </AnimatePresence>

        {product.variants.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const variantAvailable = (availability[v.id] ?? 0) > 0;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                      selectedVariantId === v.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    } ${!variantAvailable ? "opacity-40" : ""}`}
                  >
                    {v.colorHex && (
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-foreground/10"
                        style={{ backgroundColor: v.colorHex }}
                      />
                    )}
                    {locale === "ar" ? v.nameAr : v.nameEn}
                    {!variantAvailable && <span className="text-[10px]">({t("outOfStock")})</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!isCustomRequest ? (
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full border border-border">
              <button
                className="p-2.5"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="decrease"
                disabled={isOutOfStock}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-6 text-center font-semibold">{qty}</span>
              <button
                className="p-2.5"
                onClick={() => setQty((q) => q + 1)}
                aria-label="increase"
                disabled={isOutOfStock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary"
            >
              <ShoppingBag className="h-4 w-4" />
              {isOutOfStock ? t("outOfStock") : t("addToCart")}
            </button>
          </div>
        ) : (
          <button
            onClick={handleRequestService}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            {t("customService")}
          </button>
        )}
      </div>
    </div>
  );
}
