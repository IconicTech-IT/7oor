"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatEGP } from "@/lib/currency";
import { fadeUp } from "@/lib/motion";
import type { Tables } from "@/lib/database.types";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  confirmed: "bg-warning/10 text-warning",
  done: "bg-success/10 text-success",
  cancelled: "bg-danger/10 text-danger",
};

type Order = Tables<"sales_orders"> & {
  invoice: Tables<"invoices"> | null;
  items: Tables<"sales_order_items">[];
};

export function OrdersRealtimeList({ orders }: { orders: Order[] }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-sales-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales_orders" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (orders.length === 0) {
    return <p className="py-16 text-center text-muted">No orders yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <motion.div
          key={order.id}
          layout
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.3 }}
        >
          <Link
            href={`/admin/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary"
          >
            <div>
              <p className="font-bold">{order.order_number}</p>
              <p className="text-xs text-muted">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·{" "}
                {order.fulfillment_method} · {order.payment_method}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold text-primary">
                {formatEGP(order.total, "en")}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  STATUS_COLORS[order.status] ?? ""
                }`}
              >
                {order.status}
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
