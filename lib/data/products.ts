import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { ProductWithRelations, ProductWithCombo } from "@/lib/types";

const BASE_SELECT = "*, variants:product_variants(*), category:categories(*)";

export const getFeaturedProducts = unstable_cache(
  async (limit = 8): Promise<ProductWithRelations[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(BASE_SELECT)
      .eq("is_active", true)
      .neq("type", "custom_request")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) console.error("getFeaturedProducts:", error.message);
    return (data ?? []) as unknown as ProductWithRelations[];
  },
  ["featured-products"],
  { revalidate: 60, tags: ["products"] },
);

export type ProductFilters = {
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyProductFilters(query: any, filters: ProductFilters) {
  let q = query;
  if (filters.categoryIds?.length) q = q.in("category_id", filters.categoryIds);
  if (typeof filters.minPrice === "number") q = q.gte("price", filters.minPrice);
  if (typeof filters.maxPrice === "number") q = q.lte("price", filters.maxPrice);
  if (filters.search?.trim()) {
    const term = filters.search.trim().replace(/[%,]/g, "");
    q = q.or(`name_ar.ilike.%${term}%,name_en.ilike.%${term}%`);
  }
  return q;
}

export const getProducts = unstable_cache(
  async (filters: ProductFilters = {}): Promise<ProductWithRelations[]> => {
    const supabase = createPublicClient();
    const base = supabase.from("products").select(BASE_SELECT).eq("is_active", true).neq("type", "custom_request");
    let query = applyProductFilters(base, filters).order("created_at", { ascending: false });
    if (typeof filters.limit === "number" && typeof filters.offset === "number") {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    const { data, error } = await query;
    if (error) console.error("getProducts:", error.message);
    return (data ?? []) as unknown as ProductWithRelations[];
  },
  ["products-list"],
  { revalidate: 60, tags: ["products"] },
);

export const getProductsCount = unstable_cache(
  async (filters: ProductFilters = {}): Promise<number> => {
    const supabase = createPublicClient();
    const base = supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .neq("type", "custom_request");
    const { count, error } = await applyProductFilters(base, filters);
    if (error) console.error("getProductsCount:", error.message);
    return count ?? 0;
  },
  ["products-count"],
  { revalidate: 60, tags: ["products"] },
);

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<ProductWithCombo | null> => {
    const supabase = createPublicClient();
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
  },
  ["product-by-slug"],
  { revalidate: 60, tags: ["products"] },
);

export const getRelatedProducts = unstable_cache(
  async (categoryId: string | null, excludeProductId: string, limit = 8): Promise<ProductWithRelations[]> => {
    if (!categoryId) return [];
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(BASE_SELECT)
      .eq("is_active", true)
      .eq("category_id", categoryId)
      .neq("id", excludeProductId)
      .limit(limit);
    if (error) console.error("getRelatedProducts:", error.message);
    return (data ?? []) as unknown as ProductWithRelations[];
  },
  ["related-products"],
  { revalidate: 60, tags: ["products"] },
);

/** Unfiltered (includes inactive / custom_request / combo) — for the admin panel only. Always live. */
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

export const getDeliveryFee = unstable_cache(
  async (): Promise<number> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("settings").select("value").eq("key", "delivery_fee").single();
    if (error) console.error("getDeliveryFee:", error.message);
    const value = data?.value as { amount?: number } | undefined;
    return value?.amount ?? 0;
  },
  ["delivery-fee"],
  { revalidate: 300, tags: ["settings"] },
);

export type PaymentInfo = { instapay: string; vodafoneCash: string; otherWalletNote: string };

export const getPaymentInfo = unstable_cache(
  async (): Promise<PaymentInfo> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("settings").select("value").eq("key", "payment_info").single();
    if (error) console.error("getPaymentInfo:", error.message);
    const value = data?.value as { instapay?: string; vodafone_cash?: string; other_wallet_note?: string } | undefined;
    return {
      instapay: value?.instapay ?? "",
      vodafoneCash: value?.vodafone_cash ?? "",
      otherWalletNote: value?.other_wallet_note ?? "",
    };
  },
  ["payment-info"],
  { revalidate: 300, tags: ["settings"] },
);
