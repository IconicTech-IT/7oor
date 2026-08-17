"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { setRoleSchema, setRoleZodSchema } from "@/lib/validators/admin-staff";
import { validateBoth } from "@/lib/validate";

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
