import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type StaffAccount = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
};

/**
 * Lists every account (profiles row) joined with its auth email. Only ever call this
 * from the admin staff page — it uses the service-role client to read auth.users, which
 * bypasses RLS.
 */
export async function getAllStaffAndCustomers(): Promise<StaffAccount[]> {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, created_at")
    .order("created_at");

  const adminClient = createAdminClient();
  const emailById = new Map<string, string | null>();
  let page = 1;
  const perPage = 50;
  for (;;) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) break;
    for (const user of data.users) {
      emailById.set(user.id, user.email ?? null);
    }
    if (!data.nextPage) break;
    page = data.nextPage;
  }

  return (profiles ?? []).map((profile) => ({
    id: profile.id,
    email: emailById.get(profile.id) ?? null,
    fullName: profile.full_name,
    phone: profile.phone,
    role: profile.role,
    createdAt: profile.created_at,
  }));
}
