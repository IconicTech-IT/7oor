"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteObjects } from "@/lib/r2";

export type ActionResult = { success?: boolean; error?: string; deletedCount?: number };

export async function deleteStorageObjectsAction(keys: string[]): Promise<ActionResult> {
  if (!Array.isArray(keys) || keys.length === 0) return { error: "No files selected" };
  if (keys.some((k) => typeof k !== "string" || k.length === 0 || k.includes(".."))) {
    return { error: "Invalid file key" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  try {
    await deleteObjects(keys);
  } catch (err) {
    console.error("deleteStorageObjectsAction:", err);
    return { error: "Failed to delete files" };
  }

  revalidatePath("/admin/storage");
  return { success: true, deletedCount: keys.length };
}
