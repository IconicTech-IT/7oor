"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCartStore, cartCount, useCartHydrated } from "@/lib/store/cart";
import { Tooltip } from "@/components/ui/tooltip";

export function CartButton() {
  const items = useCartStore((s) => s.items);
  const open = useCartStore((s) => s.open);
  const hydrated = useCartHydrated();
  const t = useTranslations("nav");

  const count = hydrated ? cartCount(items) : 0;

  return (
    <Tooltip label={t("cart")}>
      <button
        type="button"
        onClick={open}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5"
        aria-label={t("cart")}
      >
        <ShoppingBag className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
            {count}
          </span>
        )}
      </button>
    </Tooltip>
  );
}
