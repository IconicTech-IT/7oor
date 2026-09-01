import "server-only";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";

/** Cloudflare R2 is S3-compatible — same SDK, just a different endpoint and no egress fees. */
const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

const isConfigured = Boolean(
  process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME,
);

export type R2Prefix = "product-images" | "payment-screenshots" | "request-attachments";

export type R2Object = { key: string; size: number; lastModified: Date };

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }),
  );
}

export function publicUrlFor(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

/** Strips the public base URL back down to the raw object key, or null if it's not one of ours. */
export function keyFromPublicUrl(url: string): string | null {
  if (!PUBLIC_URL || !url.startsWith(`${PUBLIC_URL}/`)) return null;
  return url.slice(PUBLIC_URL.length + 1);
}

export async function getSignedUrl(key: string, expiresInSeconds = 60 * 60 * 24 * 7): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getS3SignedUrl(client, cmd, { expiresIn: expiresInSeconds });
}

export async function deleteObject(key: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/** R2 accepts up to 1000 keys per batch delete call. */
export async function deleteObjects(keys: string[]): Promise<void> {
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    if (batch.length === 0) continue;
    await client.send(
      new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: batch.map((Key) => ({ Key })) } }),
    );
  }
}

/**
 * Only the read path degrades gracefully — the admin storage/media pages list objects just to
 * render an overview, and R2 not being configured yet shouldn't crash those pages. Uploads and
 * deletes still throw normally: those are real actions that genuinely can't succeed without it.
 */
export async function listObjects(prefix: string): Promise<R2Object[]> {
  if (!isConfigured) {
    console.error("listObjects: R2 is not configured (missing R2_* env vars) — returning empty");
    return [];
  }

  const out: R2Object[] = [];
  let ContinuationToken: string | undefined;
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, ContinuationToken }),
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key) out.push({ key: obj.Key, size: obj.Size ?? 0, lastModified: obj.LastModified ?? new Date(0) });
    }
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return out;
}
