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

export type PurchaseBillData = {
  poNumber: string;
  status: string;
  createdAt: string;
  supplierName: string;
  supplierPhone: string;
  supplierEmail: string;
  items: { name: string; qty: number; unitCost: number; lineTotal: number }[];
  total: number;
};

/** RLS on purchase_orders already restricts this to staff/admin. */
export async function getPurchaseBillData(id: string): Promise<PurchaseBillData | null> {
  const supabase = await createClient();
  const { data: po, error } = await supabase
    .from("purchase_orders")
    .select("*, supplier:suppliers(*), items:purchase_order_items(*, product:products(name_en), variant:product_variants(name_en))")
    .eq("id", id)
    .single();
  if (error || !po) return null;

  return {
    poNumber: po.po_number,
    status: po.status,
    createdAt: new Date(po.created_at).toLocaleDateString("en-GB"),
    supplierName: po.supplier?.name ?? "—",
    supplierPhone: po.supplier?.phone ?? "",
    supplierEmail: po.supplier?.email ?? "",
    items: po.items.map((i) => ({
      name: i.variant ? `${i.product?.name_en} — ${i.variant.name_en}` : (i.product?.name_en ?? ""),
      qty: i.qty_ordered,
      unitCost: i.unit_cost,
      lineTotal: i.qty_ordered * i.unit_cost,
    })),
    total: po.items.reduce((sum, i) => sum + i.qty_ordered * i.unit_cost, 0),
  };
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
