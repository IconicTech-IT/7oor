"use client";

import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

/** True once mounted on the client — avoids an SSR/client mismatch for browser-only state (theme, viewport, etc). */
export function useMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}
