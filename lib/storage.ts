import "server-only";
import { putObject, publicUrlFor, getSignedUrl as getR2SignedUrl, deleteObject, type R2Prefix } from "@/lib/r2";
import { compressForStorage } from "@/lib/image-compress";

/** Uploads a product image (public bucket) and returns its public URL. Compressed to WebP first. */
export async function uploadProductImage(file: File): Promise<string> {
  const { buffer, contentType, ext } = await compressForStorage(file);
  const key = `product-images/${crypto.randomUUID()}.${ext}`;
  await putObject(key, buffer, contentType);
  return publicUrlFor(key);
}

/**
 * Uploads a user-owned file under `${bucket}/${userId}/...` and returns the object key — not a
 * public URL, since these are private. Use getSignedUrl() to produce a shareable link when
 * needed (email, admin view). Compressed to WebP first when the upload is an image.
 */
export async function uploadUserFile(
  bucket: Extract<R2Prefix, "request-attachments" | "payment-screenshots">,
  userId: string,
  file: File,
): Promise<string> {
  const { buffer, contentType, ext } = await compressForStorage(file);
  const key = `${bucket}/${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  await putObject(key, buffer, contentType);
  return key;
}

export async function getSignedUrl(key: string, expiresInSeconds = 60 * 60 * 24 * 7): Promise<string | null> {
  try {
    return await getR2SignedUrl(key, expiresInSeconds);
  } catch (err) {
    console.error("getSignedUrl:", err);
    return null;
  }
}

export async function deleteStoredFile(key: string): Promise<void> {
  await deleteObject(key);
}
