"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function switchTo(next: "ar" | "en") {
    router.replace(
      // @ts-expect-error -- pathname can carry dynamic params typed by next-intl
      { pathname, params },
      { locale: next },
    );
  }

  return (
    <button
      type="button"
      onClick={() => switchTo(locale === "ar" ? "en" : "ar")}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
      aria-label="Switch language"
    >
      <Languages className="h-4 w-4" />
      {locale === "ar" ? "EN" : "AR"}
    </button>
  );
}
