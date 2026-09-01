"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { setUserRoleAction } from "@/lib/actions/admin-staff";

const ROLES = ["customer", "staff", "admin"] as const;

export function RoleSelect({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("admin.staffPage");
  const [saving, setSaving] = useState(false);

  async function handleChange(role: string) {
    setSaving(true);
    const result = await setUserRoleAction({ userId, role });
    setSaving(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(t("toastRoleUpdated"));
      router.refresh();
    }
  }

  if (disabled) {
    return (
      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
        {t(`roles.${currentRole}` as "roles.admin")} ({t("you")})
      </span>
    );
  }

  return (
    <select
      defaultValue={currentRole}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
    >
      {ROLES.map((role) => (
        <option key={role} value={role}>
          {t(`roles.${role}` as "roles.admin")}
        </option>
      ))}
    </select>
  );
}
