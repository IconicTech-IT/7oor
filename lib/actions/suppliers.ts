"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supplierSchema, supplierZodSchema, type SupplierValues } from "@/lib/validators/purchase";
import { validateBoth, isUuid } from "@/lib/validate";
import { assertSection } from "@/lib/admin-permissions";

export type ActionResult = { success?: boolean; error?: string; id?: string };

export async function createSupplierAction(input: SupplierValues): Promise<ActionResult> {
  const sectionError = await assertSection("suppliers");
  if (sectionError) return { error: sectionError };

  let data;
  try {
    data = await validateBoth(supplierSchema, supplierZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("suppliers")
    .insert({
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/purchases");
  revalidatePath("/admin/suppliers");
  return { success: true, id: row.id };
}

export async function updateSupplierAction(id: string, input: SupplierValues): Promise<ActionResult> {
  const sectionError = await assertSection("suppliers");
  if (sectionError) return { error: sectionError };

  if (!isUuid(id)) return { error: "Invalid supplier id" };
  let data;
  try {
    data = await validateBoth(supplierSchema, supplierZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/purchases");
  revalidatePath("/admin/suppliers");
  return { success: true };
}

export async function deleteSupplierAction(id: string): Promise<ActionResult> {
  const sectionError = await assertSection("suppliers");
  if (sectionError) return { error: sectionError };

  if (!isUuid(id)) return { error: "Invalid supplier id" };
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return { error: "This supplier has purchase orders and can't be deleted." };
    }
    return { error: error.message };
  }
  revalidatePath("/admin/purchases");
  revalidatePath("/admin/suppliers");
  return { success: true };
}
