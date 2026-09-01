"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

/** Refreshes the page live when purchases are received or stock otherwise moves. */
export function InventoryRealtimeBoundary({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-inventory")
      .on("postgres_changes", { event: "*", schema: "public", table: "stock_lots" }, () => router.refresh())
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_movements" },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchase_orders" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
