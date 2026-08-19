import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export type AvailabilityMap = Map<string, number>;

function key(productId: string, variantId: string | null) {
  return `${productId}:${variantId ?? ""}`;
}

// Postgres int4 max — get_availability_snapshot()'s stand-in for "unlimited" (force-
// available combos, or combos with no components), converted to real Infinity below.
const UNLIMITED = 2147483647;

/**
 * On-hand minus reserved (open sales orders) for every product/variant, plus combo
 * products resolved from their components. Computed entirely inside
 * get_availability_snapshot() (SECURITY DEFINER, granted to anon+authenticated) —
 * stock_lots/sales_orders/sales_order_items are RLS-locked to admin/staff/order-owner,
 * so a plain anon-client read of those tables always returned zero rows and made
 * every product look permanently out of stock. The RPC returns only aggregated
 * available-quantity numbers, never raw lot rows (which carry unit_cost — real COGS
 * data that must stay private). This is a soft storefront UX signal, not a hard
 * checkout block — create_sales_order() re-checks stock authoritatively server-side.
 */
const getAvailabilityRecordCached = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("get_availability_snapshot");
    if (error) {
      console.error("getAvailabilityRecordCached:", error.message);
      return {};
    }
    const record: Record<string, number> = {};
    for (const row of data ?? []) {
      record[key(row.product_id, row.variant_id)] = row.available;
    }
    return record;
  },
  ["availability-map"],
  { revalidate: 60, tags: ["availability"] },
);

export async function getAvailabilityMap(): Promise<AvailabilityMap> {
  const record = await getAvailabilityRecordCached();
  return new Map(
    Object.entries(record).map(([k, v]) => [k, v >= UNLIMITED ? Number.POSITIVE_INFINITY : v]),
  );
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
