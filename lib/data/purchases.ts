import { createClient } from "@/lib/supabase/server";

export async function getSuppliers() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("suppliers").select("*").order("name");
  if (error) console.error("getSuppliers:", error.message);
  return data ?? [];
}

export async function getAllPurchaseOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, supplier:suppliers(name), items:purchase_order_items(*)")
    .order("created_at", { ascending: false });
  if (error) console.error("getAllPurchaseOrders:", error.message);
  return data ?? [];
}

export async function getPurchaseOrderDetail(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .select(
      "*, supplier:suppliers(*), items:purchase_order_items(*, product:products(name_en, name_ar), variant:product_variants(name_en, name_ar))",
    )
    .eq("id", id)
    .single();
  if (error) {
    console.error("getPurchaseOrderDetail:", error.message);
    return null;
  }
  return data;
}

export async function getPurchaseReturns(purchaseOrderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_returns")
    .select(
      "*, items:purchase_return_items(*, product:products(name_en, name_ar), variant:product_variants(name_en, name_ar))",
    )
    .eq("purchase_order_id", purchaseOrderId)
    .order("created_at", { ascending: false });
  if (error) console.error("getPurchaseReturns:", error.message);
  return data ?? [];
}
