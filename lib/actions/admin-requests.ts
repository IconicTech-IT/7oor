"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/storage";
import {
  updateRequestStatusSchema,
  updateRequestStatusZodSchema,
  type UpdateRequestStatusValues,
} from "@/lib/validators/admin-request";
import { validateBoth, isUuid } from "@/lib/validate";

export type ActionResult = { success?: boolean; error?: string };

// RLS ("staff update requests") already restricts this to admin/staff.
export async function updateRequestStatusAction(
  id: string,
  input: UpdateRequestStatusValues,
): Promise<ActionResult> {
  if (!isUuid(id)) return { error: "Invalid request id" };

  let data;
  try {
    data = await validateBoth(updateRequestStatusSchema, updateRequestStatusZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("requests")
    .update({
      status: data.status,
      admin_notes: data.adminNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/requests");
  revalidatePath(`/admin/requests/${id}`);
  return { success: true };
}

export async function getRequestAttachmentUrlAction(path: string): Promise<string | null> {
  if (typeof path !== "string" || path.length === 0 || path.includes("..")) return null;
  return getSignedUrl(path);
}
