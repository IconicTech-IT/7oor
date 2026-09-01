"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
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

const FULFILLMENT_KEY: Record<string, "pickup" | "delivery"> = {
  pickup: "pickup",
  delivery: "delivery",
};

const PAYMENT_METHOD_KEY: Record<string, "cash" | "instapay" | "vodafoneCash" | "otherWallet"> = {
  cash: "cash",
  instapay: "instapay",
  vodafone_cash: "vodafoneCash",
  other_wallet: "otherWallet",
};

type Order = Tables<"sales_orders"> & {
  invoice: Tables<"invoices"> | null;
  items: Tables<"sales_order_items">[];
};

export function OrdersRealtimeList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const t = useTranslations("admin.orders");
  const tStatus = useTranslations("account.orderStatus");
  const tCheckout = useTranslations("checkout");

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
    return <p className="py-16 text-center text-muted">{t("empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        const fulfillmentKey = FULFILLMENT_KEY[order.fulfillment_method];
        const fulfillmentLabel = fulfillmentKey ? tCheckout(fulfillmentKey) : order.fulfillment_method;
        const paymentKey = PAYMENT_METHOD_KEY[order.payment_method];
        const paymentLabel = paymentKey ? tCheckout(paymentKey) : order.payment_method;
        return (
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
                <div className="flex items-center gap-2">
                  <p className="font-bold">{order.order_number}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      order.source === "manual"
                        ? "bg-accent/10 text-accent"
                        : "bg-muted/10 text-muted"
                    }`}
                  >
                    {t(`source.${order.source}` as "source.manual")}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  {new Date(order.created_at).toLocaleString("en-GB")} ·{" "}
                  {t("itemCount", { count: order.items.length })} · {fulfillmentLabel} · {paymentLabel}
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
                  {tStatus(order.status as "new")}
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
