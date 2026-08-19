"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Sun, Moon } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("common");
  const label = resolvedTheme === "dark" ? t("toggleThemeLight") : t("toggleThemeDark");

  return (
    <Tooltip label={label}>
      <button
        type="button"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/5"
        aria-label={label}
      >
        {resolvedTheme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </button>
    </Tooltip>
  );
}
