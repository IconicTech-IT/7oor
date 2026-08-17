"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { X } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { localized } from "@/lib/types";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  categories: Category[];
  selectedCategory?: string;
  minPrice?: string;
  maxPrice?: string;
  searchQuery?: string;
};

export function ProductsFilterBar({ categories, selectedCategory, minPrice, maxPrice, searchQuery }: Props) {
  const t = useTranslations("products.filters");
  const tp = useTranslations("products");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [min, setMin] = useState(minPrice ?? "");
  const [max, setMax] = useState(maxPrice ?? "");
  const [search, setSearch] = useState(searchQuery ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyParams = useCallback(
    (next: { category?: string; min?: string; max?: string; search?: string }) => {
      const params = new URLSearchParams();
      const category = next.category !== undefined ? next.category : selectedCategory;
      const minVal = next.min !== undefined ? next.min : min;
      const maxVal = next.max !== undefined ? next.max : max;
      const searchVal = next.search !== undefined ? next.search : search;
      if (category) params.set("category", category);
      if (minVal) params.set("min", minVal);
      if (maxVal) params.set("max", maxVal);
      if (searchVal) params.set("q", searchVal);
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    },
    [pathname, router, selectedCategory, min, max, search],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyParams({ min, max, search });
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, search]);

  const hasFilters = Boolean(selectedCategory || minPrice || maxPrice || searchQuery);

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div>
        <label htmlFor="product-search" className="sr-only">
          {tp("search")}
        </label>
        <input
          id="product-search"
          type="search"
          placeholder={tp("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold">{t("category")}</h2>
        {hasFilters && (
          <button
            onClick={() => {
              setMin("");
              setMax("");
              setSearch("");
              router.push(pathname);
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-danger hover:underline"
          >
            <X className="h-3 w-3" />
            {t("clear")}
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 lg:flex-col">
        <button
          onClick={() => applyParams({ category: "" })}
          className={cn(
            "rounded-full border px-3 py-1.5 text-start text-sm font-medium transition-colors lg:rounded-lg",
            !selectedCategory
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-primary",
          )}
        >
          {t("allCategories")}
        </button>
        {categories.map((cat) => (
          <div key={cat.id} className="flex flex-col gap-1">
            <button
              onClick={() => applyParams({ category: cat.slug })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-start text-sm font-medium transition-colors lg:rounded-lg",
                selectedCategory === cat.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary",
              )}
            >
              {localized(locale, cat.name_ar, cat.name_en)}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-bold">{t("price")}</h2>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder={t("minPrice")}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min={0}
            placeholder={t("maxPrice")}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>
    </aside>
  );
}
