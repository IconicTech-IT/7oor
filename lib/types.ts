import type { Tables } from "@/lib/database.types";

export type Category = Tables<"categories"> & { children?: Category[] };
export type Product = Tables<"products">;
export type ProductVariant = Tables<"product_variants">;
export type ComboComponent = Tables<"product_combo_components">;
export type Supplier = Tables<"suppliers">;

export type ProductWithRelations = Product & {
  variants: ProductVariant[];
  category: Category | null;
};

export type ProductWithCombo = ProductWithRelations & {
  combo_components: (ComboComponent & {
    component_product: Pick<Product, "id" | "name_ar" | "name_en" | "slug"> | null;
    component_variant: Pick<ProductVariant, "id" | "name_ar" | "name_en"> | null;
  })[];
};

export function localized<T extends string>(
  locale: string,
  ar: T | null,
  en: T | null,
): T {
  return (locale === "ar" ? ar : en) ?? ar ?? en ?? ("" as T);
}
