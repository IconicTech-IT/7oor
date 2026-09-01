import "server-only";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { ADMIN_SECTIONS, isAdminSection, type AdminSection } from "@/lib/admin-sections";

export { ADMIN_SECTIONS, isAdminSection };
export type { AdminSection };

export async function getStaffSections(userId: string): Promise<AdminSection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff_permissions")
    .select("sections")
    .eq("user_id", userId)
    .maybeSingle();
  return ((data?.sections ?? []) as string[]).filter(isAdminSection);
}

/**
 * Enforces section access for a page/layout: admins always pass, staff need the section
 * explicitly granted (deny-by-default — a new staff account starts with no sections), and
 * anyone else gets bounced to the admin dashboard. Call at the top of a section's layout.tsx.
 */
export async function requireSection(section: AdminSection): Promise<void> {
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

  if (profile?.role === "admin") return;

  if (profile?.role === "staff") {
    const sections = await getStaffSections(user!.id);
    if (sections.includes(section)) return;
  }

  redirect({ href: "/admin", locale });
}

/**
 * Same check as requireSection but for Server Actions, which can be invoked directly
 * regardless of whether the page/nav item is hidden — so this is the real enforcement
 * boundary, not just a UX nicety. Returns an error string instead of redirecting.
 */
export async function assertSection(section: AdminSection): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Not authenticated";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") return null;

  if (profile?.role === "staff") {
    const sections = await getStaffSections(user.id);
    if (sections.includes(section)) return null;
  }

  return "Not authorized for this section";
}
