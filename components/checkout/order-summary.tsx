import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CartItem } from "@/lib/store/cart";
import { formatEGP } from "@/lib/currency";

type Props = {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  locale: "ar" | "en";
};

export function OrderSummary({ items, subtotal, deliveryFee, total, locale }: Props) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");

  return (
    <aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
      <h2 className="text-sm font-bold">{tCart("title")}</h2>
      <ul className="mt-4 flex max-h-64 flex-col gap-3 overflow-y-auto">
        {items.map((item) => (
          <li key={`${item.productId}:${item.variantId ?? ""}`} className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-background">
              {item.image ? (
                <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-2">
                  <ImageOff className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="flex-1 text-xs">
              <p className="line-clamp-1 font-semibold">
                {locale === "ar" ? item.nameAr : item.nameEn}
              </p>
              <p className="text-muted">× {item.qty}</p>
            </div>
            <span className="text-xs font-bold">{formatEGP(item.price * item.qty, locale)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted">
          <span>{tCart("subtotal")}</span>
          <span>{formatEGP(subtotal, locale)}</span>
        </div>
        {deliveryFee > 0 && (
          <div className="flex justify-between text-muted">
            <span>{t("deliveryFee")}</span>
            <span>{formatEGP(deliveryFee, locale)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-extrabold">
          <span>{t("total")}</span>
          <span className="text-primary">{formatEGP(total, locale)}</span>
        </div>
      </div>
    </aside>
  );
}
