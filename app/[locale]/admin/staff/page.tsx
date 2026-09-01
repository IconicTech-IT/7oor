import { Fragment } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { getAllStaffAndCustomers } from "@/lib/data/admin-staff";
import { RoleSelect } from "./role-select";
import { ResetPasswordDialog } from "@/components/admin/reset-password-dialog";
import { StaffPermissionsEditor } from "@/components/admin/staff-permissions-editor";

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
  const t = await getTranslations("admin.staffPage");

  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-start text-xs font-bold uppercase tracking-wide text-muted">
              <th className="px-4 py-3 text-start">{t("table.name")}</th>
              <th className="px-4 py-3 text-start">{t("table.email")}</th>
              <th className="px-4 py-3 text-start">{t("table.phone")}</th>
              <th className="px-4 py-3 text-start">{t("table.role")}</th>
              <th className="px-4 py-3 text-start">{t("table.joined")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const isSelf = account.id === user!.id;
              return (
                <Fragment key={account.id}>
                  <tr className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-semibold">{account.fullName ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{account.email ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{account.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <RoleSelect userId={account.id} currentRole={account.role} disabled={isSelf} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(account.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-EG")}
                    </td>
                    <td className="px-4 py-3">
                      <ResetPasswordDialog
                        userId={account.id}
                        label={account.fullName ?? account.email ?? account.id}
                      />
                    </td>
                  </tr>
                  {account.role === "staff" && (
                    <tr className="border-b border-border last:border-0">
                      <td colSpan={6} className="px-4 pb-3">
                        <StaffPermissionsEditor userId={account.id} initialSections={account.sections} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
