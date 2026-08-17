import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { getAllStaffAndCustomers } from "@/lib/data/admin-staff";
import { RoleSelect } from "./role-select";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const locale = await getLocale();

  if (!user) redirect({ href: "/login", locale });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect({ href: "/admin", locale });
  }

  const accounts = await getAllStaffAndCustomers();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Staff</h1>
      <p className="mt-1 text-sm text-muted">
        Manage account roles. You cannot change your own role.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-start text-xs font-bold uppercase tracking-wide text-muted">
              <th className="px-4 py-3 text-start">Name</th>
              <th className="px-4 py-3 text-start">Email</th>
              <th className="px-4 py-3 text-start">Phone</th>
              <th className="px-4 py-3 text-start">Role</th>
              <th className="px-4 py-3 text-start">Joined</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-semibold">{account.fullName ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{account.email ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{account.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <RoleSelect
                    userId={account.id}
                    currentRole={account.role}
                    disabled={account.id === user!.id}
                  />
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(account.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-EG")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
