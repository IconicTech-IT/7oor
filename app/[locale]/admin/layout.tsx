import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { getStaffSections } from "@/lib/admin-permissions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    redirect({ href: "/", locale });
  }

  const sections = profile!.role === "staff" ? await getStaffSections(user!.id) : null;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px]">
      <AdminSidebar role={profile!.role} sections={sections} />
      <div className="flex-1 overflow-x-hidden px-4 py-8 sm:px-8">{children}</div>
    </div>
  );
}
