"use client";

import { useTheme } from "next-themes";
import { Toaster, type ToasterProps } from "sonner";
import { useMounted } from "@/lib/use-mounted";

export function ToastProvider({
  position,
  richColors,
}: {
  position: ToasterProps["position"];
  richColors?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  return (
    <Toaster
      position={position}
      richColors={richColors}
      theme={mounted ? (resolvedTheme as "light" | "dark" | undefined) : undefined}
    />
  );
}
