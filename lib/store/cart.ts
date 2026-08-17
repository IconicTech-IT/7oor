"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  variantId: string | null;
  slug: string;
  nameAr: string;
  nameEn: string;
  variantNameAr?: string | null;
  variantNameEn?: string | null;
  price: number;
  image: string | null;
  qty: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  setQty: (productId: string, variantId: string | null, qty: number) => void;
  clear: () => void;
};

const lineKey = (productId: string, variantId: string | null) =>
  `${productId}:${variantId ?? ""}`;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addItem: (item) =>
        set((state) => {
          const key = lineKey(item.productId, item.variantId);
          const existing = state.items.find(
            (i) => lineKey(i.productId, i.variantId) === key,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                lineKey(i.productId, i.variantId) === key
                  ? { ...i, qty: i.qty + item.qty }
                  : i,
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, item], isOpen: true };
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => lineKey(i.productId, i.variantId) !== lineKey(productId, variantId),
          ),
        })),
      setQty: (productId, variantId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              lineKey(i.productId, i.variantId) === lineKey(productId, variantId)
                ? { ...i, qty }
                : i,
            )
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "7oor-cart" },
  ),
);

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

/** True once the persisted cart has been read from localStorage — avoids an SSR/client mismatch. */
export function useCartHydrated() {
  return useSyncExternalStore(
    (callback) => useCartStore.persist.onFinishHydration(callback),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}
