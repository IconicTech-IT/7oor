import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Category } from "@/lib/types";

export const getAllCategoriesFlat = unstable_cache(
  async (): Promise<Category[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    return data ?? [];
  },
  ["categories-flat"],
  { revalidate: 300, tags: ["categories"] },
);

export async function getCategoryTree(): Promise<Category[]> {
  const categories = await getAllCategoriesFlat();
  const topLevel = categories.filter((c) => !c.parent_id);
  return topLevel.map((top) => ({
    ...top,
    children: categories.filter((c) => c.parent_id === top.id),
  }));
}

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<Category | null> => {
    const supabase = createPublicClient();
    const { data } = await supabase.from("categories").select("*").eq("slug", slug).single();
    return data ?? null;
  },
  ["category-by-slug"],
  { revalidate: 300, tags: ["categories"] },
);

/** Returns [category.id, ...descendantIds] for a given slug — used to filter products by a top-level category. */
export async function getCategoryIdsForSlug(slug: string): Promise<string[]> {
  const categories = await getAllCategoriesFlat();
  const root = categories.find((c) => c.slug === slug);
  if (!root) return [];
  const ids = [root.id];
  const children = categories.filter((c) => c.parent_id === root.id);
  ids.push(...children.map((c) => c.id));
  return ids;
}
