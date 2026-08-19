"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema, categoryZodSchema, type CategoryValues } from "@/lib/validators/category";
import { validateBoth, isUuid } from "@/lib/validate";

export type ActionResult = { success?: boolean; error?: string; id?: string };

// RLS ("staff write categories") already restricts this to admin/staff regardless of
// what the client sends — this is a second line of defense, not the only one.
export async function createCategoryAction(input: CategoryValues): Promise<ActionResult> {
  let data;
  try {
    data = await validateBoth(categorySchema, categoryZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("categories")
    .insert({
      name_ar: data.nameAr,
      name_en: data.nameEn,
      slug: data.slug,
      parent_id: data.parentId || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidateTag("categories", "max");
  return { success: true, id: row.id };
}

export async function updateCategoryAction(
  id: string,
  input: CategoryValues,
): Promise<ActionResult> {
  if (!isUuid(id)) return { error: "Invalid category id" };
  let data;
  try {
    data = await validateBoth(categorySchema, categoryZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name_ar: data.nameAr,
      name_en: data.nameEn,
      slug: data.slug,
      parent_id: data.parentId || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidateTag("categories", "max");
  return { success: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return { error: "Invalid category id" };
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  revalidateTag("categories", "max");
  return { success: true };
}
