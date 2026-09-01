"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { setRoleSchema, setRoleZodSchema } from "@/lib/validators/admin-staff";
import { validateBoth, isUuid } from "@/lib/validate";
import { isAdminSection } from "@/lib/admin-sections";

export type ActionResult = { success?: boolean; error?: string };

// The set_user_role RPC is SECURITY DEFINER and re-checks (inside the function body)
// that the caller is an admin, that the target isn't the caller, and that the role is
// one of the allowed values — this action is a second line of defense (input shape
// validation), not the only gate, matching this codebase's established pattern.
export async function setUserRoleAction(input: {
  userId: string;
  role: string;
}): Promise<ActionResult> {
  let data;
  try {
    data = await validateBoth(setRoleSchema, setRoleZodSchema, input);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_user_role", {
    p_target_user_id: data.userId,
    p_new_role: data.role,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/staff");
  return { success: true };
}

// set_staff_sections() is SECURITY DEFINER and re-checks admin-only server-side, matching
// set_user_role above.
export async function setStaffSectionsAction(
  userId: string,
  sections: string[],
): Promise<ActionResult> {
  if (!sections.every(isAdminSection)) return { error: "Invalid section" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_staff_sections", {
    p_target_user_id: userId,
    p_sections: sections,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/staff");
  return { success: true };
}

/**
 * Admin-only password reset for any account, regardless of role — no current password
 * needed. Uses the service-role Auth Admin API directly (there's no RLS/RPC boundary for
 * auth.users), so this action itself is the authorization check: it re-verifies the caller
 * is an admin before touching anyone's credentials.
 */
export async function resetUserPasswordAction(
  userId: string,
  newPassword: string,
): Promise<ActionResult> {
  if (!isUuid(userId)) return { error: "Invalid user id" };
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();
  if (!caller) return { error: "Not authenticated" };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();
  if (callerProfile?.role !== "admin") return { error: "Not authorized" };

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { error: error.message };

  return { success: true };
}
