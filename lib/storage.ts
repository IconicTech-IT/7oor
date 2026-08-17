import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Uploads a user-owned file under `${userId}/...` (required by the bucket's RLS insert
 * policy) and returns the storage object path — not a public URL, since these buckets are
 * private. Use getSignedUrl() to produce a shareable link when needed (email, admin view).
 */
export async function uploadUserFile(
  supabase: SupabaseClient<Database>,
  bucket: "request-attachments" | "payment-screenshots",
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type || "application/octet-stream" });
  if (error) throw error;
  return path;
}

export async function getSignedUrl(
  supabase: SupabaseClient<Database>,
  bucket: "request-attachments" | "payment-screenshots" | "product-images",
  path: string,
  expiresInSeconds = 60 * 60 * 24 * 7,
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
}
