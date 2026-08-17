"use client";

import { useTheme } from "next-themes";
import { Toaster, type ToasterProps } from "sonner";

export function ToastProvider({
  position,
  richColors,
}: {
  position: ToasterProps["position"];
  richColors?: boolean;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position={position}
      richColors={richColors}
      theme={resolvedTheme as "light" | "dark" | undefined}
    />
  );
}
