"use client";

import { useLocale } from "next-intl";

/** Returns -1 for RTL, 1 for LTR — multiply horizontal offsets by this instead of hardcoding direction. */
export function useDirSign() {
  const locale = useLocale();
  return locale === "ar" ? -1 : 1;
}

export function useIsRtl() {
  const locale = useLocale();
  return locale === "ar";
}
