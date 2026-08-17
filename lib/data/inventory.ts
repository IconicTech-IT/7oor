import { createClient } from "@/lib/supabase/server";

export type InventoryRow = {
  productId: string;
  variantId: string | null;
  productNameEn: string;
  productNameAr: string;
  variantNameEn: string | null;
  variantNameAr: string | null;
  onHand: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
};

export async function getInventoryOverview(): Promise<InventoryRow[]> {
  const supabase = await createClient();

  const [{ data: products }, { data: lots }, { data: openOrders }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name_ar, name_en, low_stock_threshold, type, variants:product_variants(*)")
      .in("type", ["simple"]),
    supabase.from("stock_lots").select("product_id, variant_id, qty_remaining"),
    supabase.from("sales_orders").select("id").in("status", ["new", "confirmed"]),
  ]);

  const openOrderIds = (openOrders ?? []).map((o) => o.id);
  const { data: reservedItems } =
    openOrderIds.length > 0
      ? await supabase
          .from("sales_order_items")
          .select("product_id, variant_id, qty")
          .in("sales_order_id", openOrderIds)
      : { data: [] as { product_id: string; variant_id: string | null; qty: number }[] };

  const key = (productId: string, variantId: string | null) => `${productId}:${variantId ?? ""}`;

  const onHandMap = new Map<string, number>();
  for (const lot of lots ?? []) {
    const k = key(lot.product_id, lot.variant_id);
    onHandMap.set(k, (onHandMap.get(k) ?? 0) + lot.qty_remaining);
  }

  const reservedMap = new Map<string, number>();
  for (const item of reservedItems ?? []) {
    const k = key(item.product_id, item.variant_id);
    reservedMap.set(k, (reservedMap.get(k) ?? 0) + item.qty);
  }

  const rows: InventoryRow[] = [];
  for (const p of products ?? []) {
    if (p.variants.length === 0) {
      const k = key(p.id, null);
      const onHand = onHandMap.get(k) ?? 0;
      const reserved = reservedMap.get(k) ?? 0;
      rows.push({
        productId: p.id,
        variantId: null,
        productNameEn: p.name_en,
        productNameAr: p.name_ar,
        variantNameEn: null,
        variantNameAr: null,
        onHand,
        reserved,
        available: onHand - reserved,
        lowStockThreshold: p.low_stock_threshold,
      });
    } else {
      for (const v of p.variants) {
        const k = key(p.id, v.id);
        const onHand = onHandMap.get(k) ?? 0;
        const reserved = reservedMap.get(k) ?? 0;
        rows.push({
          productId: p.id,
          variantId: v.id,
          productNameEn: p.name_en,
          productNameAr: p.name_ar,
          variantNameEn: v.name_en,
          variantNameAr: v.name_ar,
          onHand,
          reserved,
          available: onHand - reserved,
          lowStockThreshold: p.low_stock_threshold,
        });
      }
    }
  }

  return rows.sort((a, b) => a.available - b.available);
}

export async function getLowStockCount(): Promise<number> {
  const rows = await getInventoryOverview();
  return rows.filter((r) => r.available <= r.lowStockThreshold).length;
}

export type MovementRow = {
  id: string;
  productName: string;
  variantName: string | null;
  direction: string;
  qty: number;
  reason: string;
  unitCost: number | null;
  notes: string | null;
  createdAt: string;
};

export async function getRecentMovements(limit = 50): Promise<MovementRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("*, product:products(name_en), variant:product_variants(name_en)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentMovements:", error.message);
    return [];
  }

  return (data ?? []).map((m) => ({
    id: m.id,
    productName: (m.product as { name_en: string } | null)?.name_en ?? "—",
    variantName: (m.variant as { name_en: string } | null)?.name_en ?? null,
    direction: m.direction,
    qty: m.qty,
    reason: m.reason,
    unitCost: m.unit_cost,
    notes: m.notes,
    createdAt: m.created_at,
  }));
}
