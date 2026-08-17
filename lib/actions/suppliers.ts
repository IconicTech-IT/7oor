"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supplierSchema, type SupplierValues } from "@/lib/validators/purchase";

export type ActionResult = { success?: boolean; error?: string; id?: string };

export async function createSupplierAction(input: SupplierValues): Promise<ActionResult> {
  const data = await supplierSchema.validate(input, { stripUnknown: true, abortEarly: true });
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
