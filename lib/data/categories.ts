import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export async function getAllCategoriesFlat(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return data ?? [];
}

export async function getCategoryTree(): Promise<Category[]> {
  const categories = await getAllCategoriesFlat();
  const topLevel = categories.filter((c) => !c.parent_id);
  return topLevel.map((top) => ({
    ...top,
    children: categories.filter((c) => c.parent_id === top.id),
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).single();
  return data ?? null;
}

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
