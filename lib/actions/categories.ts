"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema, type CategoryValues } from "@/lib/validators/category";

export type ActionResult = { success?: boolean; error?: string; id?: string };

// RLS ("staff write categories") already restricts this to admin/staff regardless of
// what the client sends — this is a second line of defense, not the only one.
export async function createCategoryAction(input: CategoryValues): Promise<ActionResult> {
  const data = await categorySchema.validate(input, { stripUnknown: true, abortEarly: true });

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
  return { success: true, id: row.id };
}

export async function updateCategoryAction(
  id: string,
  input: CategoryValues,
): Promise<ActionResult> {
  const data = await categorySchema.validate(input, { stripUnknown: true, abortEarly: true });

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
  return { success: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/categories");
  return { success: true };
}
