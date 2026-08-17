import { createClient } from "@/lib/supabase/server";

export type AvailabilityMap = Map<string, number>;

function key(productId: string, variantId: string | null) {
  return `${productId}:${variantId ?? ""}`;
}

/**
 * On-hand minus reserved (open sales orders) for every product/variant, plus combo
 * products resolved from their components (min over components of floor(available/qty),
 * or always-available if combo_force_available is set). This is a soft storefront UX
 * signal, not a hard checkout block — per the spec, inventory is only actually deducted
 * when staff mark an order Done, so a slight oversell that staff resolve manually is
 * an accepted trade-off, not a bug.
 */
export async function getAvailabilityMap(): Promise<AvailabilityMap> {
  const supabase = await createClient();

  const [{ data: lots }, { data: openOrders }, { data: comboProducts }] = await Promise.all([
    supabase.from("stock_lots").select("product_id, variant_id, qty_remaining"),
    supabase.from("sales_orders").select("id").in("status", ["new", "confirmed"]),
    supabase.from("products").select("id, combo_force_available").eq("type", "combo"),
  ]);

  const openOrderIds = (openOrders ?? []).map((o) => o.id);
  const { data: reservedItems } =
    openOrderIds.length > 0
      ? await supabase
          .from("sales_order_items")
          .select("product_id, variant_id, qty")
          .in("sales_order_id", openOrderIds)
      : { data: [] as { product_id: string; variant_id: string | null; qty: number }[] };

  const onHand = new Map<string, number>();
  for (const lot of lots ?? []) {
    const k = key(lot.product_id, lot.variant_id);
    onHand.set(k, (onHand.get(k) ?? 0) + lot.qty_remaining);
  }
  const reserved = new Map<string, number>();
  for (const item of reservedItems ?? []) {
    const k = key(item.product_id, item.variant_id);
    reserved.set(k, (reserved.get(k) ?? 0) + item.qty);
  }

  const map: AvailabilityMap = new Map();
  for (const k of new Set([...onHand.keys(), ...reserved.keys()])) {
    map.set(k, (onHand.get(k) ?? 0) - (reserved.get(k) ?? 0));
  }

  if (comboProducts && comboProducts.length > 0) {
    const comboIds = comboProducts.map((c) => c.id);
    const { data: components } = await supabase
      .from("product_combo_components")
      .select("combo_product_id, component_product_id, component_variant_id, qty")
      .in("combo_product_id", comboIds);

    for (const combo of comboProducts) {
      if (combo.combo_force_available) {
        map.set(key(combo.id, null), Number.POSITIVE_INFINITY);
        continue;
      }
      const comboComponents = (components ?? []).filter((c) => c.combo_product_id === combo.id);
      if (comboComponents.length === 0) {
        map.set(key(combo.id, null), Number.POSITIVE_INFINITY);
        continue;
      }
      let minAvail = Number.POSITIVE_INFINITY;
      for (const c of comboComponents) {
        const compAvail = map.get(key(c.component_product_id, c.component_variant_id)) ?? 0;
        minAvail = Math.min(minAvail, Math.floor(compAvail / c.qty));
      }
      map.set(key(combo.id, null), minAvail);
    }
  }

  return map;
}

export function getAvailability(
  availabilityMap: AvailabilityMap,
  productId: string,
  variantId: string | null,
): number {
  return availabilityMap.get(key(productId, variantId)) ?? 0;
}

type CardAvailabilityInput = {
  id: string;
  type: string;
  pricing_unit: string;
  variants: { id: string }[];
};

/** Card-level signal: in stock if ANY variant has stock (the detail page handles per-variant granularity). */
export function getCardAvailability(availabilityMap: AvailabilityMap, product: CardAvailabilityInput): number {
  if (product.pricing_unit !== "item") return Number.POSITIVE_INFINITY; // page/job = on-demand service, not stocked
  if (product.variants.length === 0) return getAvailability(availabilityMap, product.id, null);
  return Math.max(...product.variants.map((v) => getAvailability(availabilityMap, product.id, v.id)));
}

/** Per-variant map (keyed by variant id, "" for the base product) for the detail page. */
export function getVariantAvailabilityRecord(
  availabilityMap: AvailabilityMap,
  product: CardAvailabilityInput,
): Record<string, number> {
  if (product.pricing_unit !== "item") {
    const record: Record<string, number> = { "": Number.POSITIVE_INFINITY };
    for (const v of product.variants) record[v.id] = Number.POSITIVE_INFINITY;
    return record;
  }
  const record: Record<string, number> = {
    "": getAvailability(availabilityMap, product.id, null),
  };
  for (const v of product.variants) {
    record[v.id] = getAvailability(availabilityMap, product.id, v.id);
  }
  return record;
}
