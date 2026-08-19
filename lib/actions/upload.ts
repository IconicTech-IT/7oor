"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadProductImage } from "@/lib/storage";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export type UploadImageResult = { url?: string; error?: string };

export async function uploadProductImageAction(formData: FormData): Promise<UploadImageResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return { error: "Unauthorized" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "No file provided" };
  if (!file.type.startsWith("image/")) return { error: "Only image files are allowed" };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "File too large (max 8MB)" };

  try {
    const url = await uploadProductImage(file);
    return { url };
  } catch (err) {
    console.error("uploadProductImageAction:", err);
    return { error: "Upload failed" };
  }
}
