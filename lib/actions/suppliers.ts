"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supplierSchema, supplierZodSchema, type SupplierValues } from "@/lib/validators/purchase";
import { validateBoth } from "@/lib/validate";

export type ActionResult = { success?: boolean; error?: string; id?: string };

export async function createSupplierAction(input: SupplierValues): Promise<ActionResult> {
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
  return { success: true, id: row.id };
}
