import { createClient } from "@/lib/supabase/server";
import { listObjects, publicUrlFor, keyFromPublicUrl } from "@/lib/r2";

export type StorageOverview = {
  totalBytes: number;
  totalCount: number;
  byPrefix: { prefix: string; bytes: number; count: number }[];
};

export async function getStorageOverview(): Promise<StorageOverview> {
  const objects = await listObjects("");
  const byPrefixMap = new Map<string, { bytes: number; count: number }>();
  let totalBytes = 0;

  for (const obj of objects) {
    const prefix = obj.key.split("/")[0] || "other";
    const entry = byPrefixMap.get(prefix) ?? { bytes: 0, count: 0 };
    entry.bytes += obj.size;
    entry.count += 1;
    byPrefixMap.set(prefix, entry);
    totalBytes += obj.size;
  }

  return {
    totalBytes,
    totalCount: objects.length,
    byPrefix: Array.from(byPrefixMap.entries())
      .map(([prefix, v]) => ({ prefix, ...v }))
      .sort((a, b) => b.bytes - a.bytes),
  };
}

export type OrphanedImage = { key: string; url: string; size: number; lastModified: string };

/** Product images in R2 that no product or variant currently references — safe to delete. */
export async function getOrphanedProductImages(): Promise<OrphanedImage[]> {
  const supabase = await createClient();
  const [objects, { data: products }, { data: variants }] = await Promise.all([
    listObjects("product-images/"),
    supabase.from("products").select("image_url"),
    supabase.from("product_variants").select("image_url"),
  ]);

  const referenced = new Set<string>();
  for (const row of [...(products ?? []), ...(variants ?? [])]) {
    if (!row.image_url) continue;
    const key = keyFromPublicUrl(row.image_url);
    if (key) referenced.add(key);
  }

  return objects
    .filter((o) => !referenced.has(o.key))
    .map((o) => ({ key: o.key, url: publicUrlFor(o.key), size: o.size, lastModified: o.lastModified.toISOString() }))
    .sort((a, b) => b.size - a.size);
}

export type StaleAttachment = { key: string; size: number; lastModified: string; ownerLabel: string; closedAt: string };

const STALE_DAYS = 90;

/**
 * Payment screenshots / request attachments belonging to orders and requests that are both
 * closed (done/cancelled, completed/rejected) and older than STALE_DAYS — good candidates to
 * purge, but never auto-deleted; the admin reviews and picks.
 */
export async function getStaleAttachments(): Promise<{
  paymentScreenshots: StaleAttachment[];
  requestAttachments: StaleAttachment[];
}> {
  const supabase = await createClient();
  const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [screenshotObjects, attachmentObjects, { data: closedOrders }, { data: closedRequests }] =
    await Promise.all([
      listObjects("payment-screenshots/"),
      listObjects("request-attachments/"),
      supabase
        .from("sales_orders")
        .select("order_number, payment_screenshot_url, done_at, cancelled_at")
        .in("status", ["done", "cancelled"])
        .not("payment_screenshot_url", "is", null),
      supabase
        .from("requests")
        .select("name, attachment_url, updated_at")
        .in("status", ["completed", "rejected"])
        .not("attachment_url", "is", null),
    ]);

  const screenshotMeta = new Map<string, { ownerLabel: string; closedAt: string }>();
  for (const o of closedOrders ?? []) {
    const key = o.payment_screenshot_url;
    const closedAt = o.done_at ?? o.cancelled_at;
    if (key && closedAt && closedAt < cutoff) {
      screenshotMeta.set(key, { ownerLabel: o.order_number, closedAt });
    }
  }

  const attachmentMeta = new Map<string, { ownerLabel: string; closedAt: string }>();
  for (const r of closedRequests ?? []) {
    const key = r.attachment_url;
    if (key && r.updated_at && r.updated_at < cutoff) {
      attachmentMeta.set(key, { ownerLabel: r.name, closedAt: r.updated_at });
    }
  }

  const toRows = (objects: { key: string; size: number; lastModified: Date }[], meta: Map<string, { ownerLabel: string; closedAt: string }>) =>
    objects
      .filter((o) => meta.has(o.key))
      .map((o) => ({ key: o.key, size: o.size, lastModified: o.lastModified.toISOString(), ...meta.get(o.key)! }))
      .sort((a, b) => a.closedAt.localeCompare(b.closedAt));

  return {
    paymentScreenshots: toRows(screenshotObjects, screenshotMeta),
    requestAttachments: toRows(attachmentObjects, attachmentMeta),
  };
}
