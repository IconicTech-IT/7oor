"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productSchema, productZodSchema, type ProductFormValues } from "@/lib/validators/product";
import { validateBoth, isUuid } from "@/lib/validate";

export type ActionResult = { success?: boolean; error?: string; id?: string };

function toProductRow(data: ProductFormValues) {
  return {
    type: data.type,
    pricing_unit: data.pricingUnit,
    name_ar: data.nameAr,
    name_en: data.nameEn,
    slug: data.slug,
    category_id: data.categoryId || null,
    short_description_ar: data.shortDescriptionAr || null,
    short_description_en: data.shortDescriptionEn || null,
    description_ar: data.descriptionAr || null,
    description_en: data.descriptionEn || null,
    price: data.price,
    image_url: data.imageUrl || null,
    is_active: data.isActive,
    low_stock_threshold: data.lowStockThreshold,
    combo_force_available: data.comboForceAvailable,
  };
}

// RLS ("staff write products/variants/combo components") is the real enforcement layer;
// this action can't do anything a direct authenticated-but-non-staff REST call couldn't
// already be blocked from doing.
export async function saveProductAction(
  productId: string | null,
  input: ProductFormValues,
): Promise<ActionResult> {
  if (productId && !isUuid(productId)) return { error: "Invalid product id" };
  let data;
  try {
    data = await validateBoth(productSchema, productZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }
  const supabase = await createClient();

  let id = productId;
  if (id) {
    const { error } = await supabase.from("products").update(toProductRow(data)).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data: row, error } = await supabase
      .from("products")
      .insert(toProductRow(data))
      .select("id")
      .single();
    if (error) return { error: error.message };
    id = row.id;
  }

  // Simplest-correct approach for an admin tool at this scale: replace the full
  // variant/combo-component sets rather than diffing them field by field.
  const { error: delVariantsError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", id);
  if (delVariantsError) return { error: delVariantsError.message };

  if (data.variants.length > 0) {
    const { error: variantsError } = await supabase.from("product_variants").insert(
      data.variants.map((v, i) => ({
        product_id: id!,
        name_ar: v.nameAr,
        name_en: v.nameEn,
        sku: v.sku || null,
        color_hex: v.colorHex || null,
        price: v.price ?? null,
        image_url: v.imageUrl || null,
        sort_order: i,
      })),
    );
    if (variantsError) return { error: variantsError.message };
  }

  const { error: delComboError } = await supabase
    .from("product_combo_components")
    .delete()
    .eq("combo_product_id", id);
  if (delComboError) return { error: delComboError.message };

  if (data.type === "combo" && data.comboComponents.length > 0) {
    const { error: comboError } = await supabase.from("product_combo_components").insert(
      data.comboComponents.map((c) => ({
        combo_product_id: id!,
        component_product_id: c.componentProductId,
        component_variant_id: c.componentVariantId || null,
        qty: c.qty,
      })),
    );
    if (comboError) return { error: comboError.message };
  }

  revalidatePath("/admin/products");
  return { success: true, id: id! };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  if (!isUuid(id)) return { error: "Invalid product id" };
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return { success: true };
}
