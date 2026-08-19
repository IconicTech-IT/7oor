import "server-only";
import sharp from "sharp";

const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 82;

export type CompressedFile = { buffer: Buffer; contentType: string; ext: string };

/**
 * Re-encodes images to WebP capped at MAX_DIMENSION on the long edge — cuts typical phone-camera
 * uploads (3-8MB) down to a few hundred KB before they ever reach storage. Non-image files
 * (e.g. request-attachment PDFs) pass through untouched. Falls back to the original bytes if
 * sharp fails on a malformed/unsupported image, so an upload never hard-fails on this step.
 */
export async function compressForStorage(file: File): Promise<CompressedFile> {
  const original = Buffer.from(await file.arrayBuffer());
  const fallbackExt = file.name.includes(".") ? file.name.split(".").pop()! : "bin";

  if (!file.type.startsWith("image/")) {
    return { buffer: original, contentType: file.type || "application/octet-stream", ext: fallbackExt };
  }

  try {
    const buffer = await sharp(original)
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    return { buffer, contentType: "image/webp", ext: "webp" };
  } catch (err) {
    console.error("compressForStorage:", err);
    return { buffer: original, contentType: file.type || "application/octet-stream", ext: fallbackExt };
  }
}
