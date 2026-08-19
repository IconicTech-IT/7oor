import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
};

/** Hover/focus label bubble for icon-only controls — CSS only, no JS state. */
export function Tooltip({ label, children, side = "bottom" }: Props) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity delay-300 duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
          side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
        )}
      >
        {label}
      </span>
    </span>
  );
}
