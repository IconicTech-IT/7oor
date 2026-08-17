"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useCartStore, cartSubtotal, useCartHydrated } from "@/lib/store/cart";
import { useDirSign } from "@/lib/rtl";
import { formatEGP } from "@/lib/currency";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const t = useTranslations("cart");
  const locale = useLocale() as "ar" | "en";
  const dirSign = useDirSign();
  const hydrated = useCartHydrated();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!hydrated) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed inset-y-0 end-0 z-50 flex w-full max-w-sm flex-col bg-card shadow-2xl"
            initial={{ x: 400 * dirSign }}
            animate={{ x: 0 }}
            exit={{ x: 400 * dirSign }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold">{t("title")}</h2>
              <button
                onClick={close}
                className="rounded-full p-2 hover:bg-black/5"
                aria-label={t("close") ?? "Close"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="mt-10 text-center text-muted">{t("empty")}</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {items.map((item) => (
                    <li
                      key={`${item.productId}:${item.variantId ?? ""}`}
                      className="flex gap-3"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-background">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-semibold">
                          {locale === "ar" ? item.nameAr : item.nameEn}
                        </p>
                        {(item.variantNameAr || item.variantNameEn) && (
                          <p className="text-xs text-muted">
                            {locale === "ar" ? item.variantNameAr : item.variantNameEn}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border border-border">
                            <button
                              className="p-1.5"
                              onClick={() =>
                                setQty(item.productId, item.variantId, item.qty - 1)
                              }
                              aria-label="decrease"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-4 text-center text-sm">{item.qty}</span>
                            <button
                              className="p-1.5"
                              onClick={() =>
                                setQty(item.productId, item.variantId, item.qty + 1)
                              }
                              aria-label="increase"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {formatEGP(item.price * item.qty, locale)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="self-start rounded-full p-1.5 text-muted hover:bg-black/5 hover:text-danger"
                        aria-label={t("remove")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4">
                <div className="mb-3 flex items-center justify-between text-base font-bold">
                  <span>{t("subtotal")}</span>
                  <span>{formatEGP(cartSubtotal(items), locale)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
                >
                  {t("checkout")}
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
