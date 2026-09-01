"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { setStaffSectionsAction } from "@/lib/actions/admin-staff";
import { ADMIN_SECTIONS, type AdminSection } from "@/lib/admin-sections";

export function StaffPermissionsEditor({
  userId,
  initialSections,
}: {
  userId: string;
  initialSections: string[];
}) {
  const [sections, setSections] = useState<Set<AdminSection>>(
    new Set(initialSections.filter((s): s is AdminSection => (ADMIN_SECTIONS as readonly string[]).includes(s))),
  );
  const [saving, setSaving] = useState(false);
  const t = useTranslations("admin.staffPage.permissions");

  function toggle(section: AdminSection) {
    setSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    const result = await setStaffSectionsAction(userId, Array.from(sections));
    setSaving(false);
    if (result.error) toast.error(result.error);
    else toast.success(t("toastUpdated"));
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border p-3">
      {ADMIN_SECTIONS.map((section) => (
        <label key={section} className="flex items-center gap-1.5 text-xs font-semibold">
          <input
            type="checkbox"
            checked={sections.has(section)}
            onChange={() => toggle(section)}
          />
          {t(`sections.${section}`)}
        </label>
      ))}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
      >
        {saving ? t("saving") : t("save")}
      </button>
    </div>
  );
}
