import { createClient } from "@/lib/supabase/server";
import type { ProductWithRelations, ProductWithCombo } from "@/lib/types";

const BASE_SELECT = "*, variants:product_variants(*), category:categories(*)";

export async function getFeaturedProducts(limit = 8): Promise<ProductWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(BASE_SELECT)
    .eq("is_active", true)
    .neq("type", "custom_request")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) console.error("getFeaturedProducts:", error.message);
  return (data ?? []) as unknown as ProductWithRelations[];
}

export type ProductFilters = {
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
};

export async function getProducts(filters: ProductFilters = {}): Promise<ProductWithRelations[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(BASE_SELECT)
    .eq("is_active", true)
    .neq("type", "custom_request");

  if (filters.categoryIds?.length) {
    query = query.in("category_id", filters.categoryIds);
  }
  if (typeof filters.minPrice === "number") {
    query = query.gte("price", filters.minPrice);
  }
  if (typeof filters.maxPrice === "number") {
    query = query.lte("price", filters.maxPrice);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) console.error("getProducts:", error.message);
  return (data ?? []) as unknown as ProductWithRelations[];
}

export async function getProductBySlug(slug: string): Promise<ProductWithCombo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `${BASE_SELECT}, combo_components:product_combo_components!product_combo_components_combo_product_id_fkey(
        *,
        component_product:products!product_combo_components_component_product_id_fkey(id, name_ar, name_en, slug),
        component_variant:product_variants!product_combo_components_component_variant_id_fkey(id, name_ar, name_en)
      )`,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) console.error("getProductBySlug:", error.message);
  return (data ?? null) as unknown as ProductWithCombo | null;
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string,
  limit = 8,
): Promise<ProductWithRelations[]> {
  if (!categoryId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(BASE_SELECT)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(limit);
  if (error) console.error("getRelatedProducts:", error.message);
  return (data ?? []) as unknown as ProductWithRelations[];
}

/** Unfiltered (includes inactive / custom_request / combo) — for the admin panel only. */
export async function getAllProductsAdmin(): Promise<ProductWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(BASE_SELECT)
    .order("created_at", { ascending: false });
  if (error) console.error("getAllProductsAdmin:", error.message);
  return (data ?? []) as unknown as ProductWithRelations[];
}

export async function getProductByIdAdmin(id: string): Promise<ProductWithCombo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `${BASE_SELECT}, combo_components:product_combo_components!product_combo_components_combo_product_id_fkey(
        *,
        component_product:products!product_combo_components_component_product_id_fkey(id, name_ar, name_en, slug),
        component_variant:product_variants!product_combo_components_component_variant_id_fkey(id, name_ar, name_en)
      )`,
    )
    .eq("id", id)
    .single();
  if (error) console.error("getProductByIdAdmin:", error.message);
  return (data ?? null) as unknown as ProductWithCombo | null;
}

export async function getDeliveryFee(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "delivery_fee")
    .single();
  if (error) console.error("getDeliveryFee:", error.message);
  const value = data?.value as { amount?: number } | undefined;
  return value?.amount ?? 0;
}
