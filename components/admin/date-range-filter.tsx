"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function DateRangeFilter({ from, to }: { from?: string; to?: string }) {
  const [fromVal, setFromVal] = useState(from ?? "");
  const [toVal, setToVal] = useState(to ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("admin.common");

  function apply() {
    const params = new URLSearchParams();
    if (fromVal) params.set("from", fromVal);
    if (toVal) params.set("to", toVal);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function clear() {
    setFromVal("");
    setToVal("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">{t("from")}</label>
        <input
          type="date"
          value={fromVal}
          onChange={(e) => setFromVal(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">{t("to")}</label>
        <input
          type="date"
          value={toVal}
          onChange={(e) => setToVal(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={apply}
        disabled={isPending}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
      >
        {t("apply")}
      </button>
      {(from || to) && (
        <button
          type="button"
          onClick={clear}
          disabled={isPending}
          className="rounded-lg border border-border px-4 py-2 text-sm font-bold hover:border-primary disabled:opacity-60"
        >
          {t("allDates")}
        </button>
      )}
    </div>
  );
}
