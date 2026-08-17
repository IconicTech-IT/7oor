import { createClient } from "@/lib/supabase/server";

export async function getInvoices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*, sales_order:sales_orders(order_number, total, customer_id)")
    .order("issued_at", { ascending: false });
  if (error) console.error("getInvoices:", error.message);
  return data ?? [];
}

export async function getBills() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("*")
    .eq("type", "expense")
    .order("entry_date", { ascending: false });
  if (error) console.error("getBills:", error.message);
  return data ?? [];
}

export async function getLedgerEntries(limit = 100) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .limit(limit);
  if (error) console.error("getLedgerEntries:", error.message);
  return data ?? [];
}

export type ReportSummary = {
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
};

export async function getReportSummary(from: string, to: string): Promise<ReportSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("type, amount")
    .gte("entry_date", from)
    .lte("entry_date", to);

  if (error) console.error("getReportSummary:", error.message);

  let revenue = 0;
  let cogs = 0;
  let expenses = 0;
  for (const entry of data ?? []) {
    if (entry.type === "revenue") revenue += entry.amount;
    else if (entry.type === "cogs") cogs += entry.amount;
    else if (entry.type === "expense") expenses += entry.amount;
  }
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expenses;
  return { revenue, cogs, grossProfit, expenses, netProfit };
}

export type TopProductRow = {
  productId: string;
  name: string;
  revenue: number;
  cogs: number;
  margin: number;
  qtySold: number;
};

export async function getTopSellingProducts(
  from: string,
  to: string,
  limit = 10,
): Promise<TopProductRow[]> {
  const supabase = await createClient();

  const { data: doneOrders } = await supabase
    .from("sales_orders")
    .select("id")
    .eq("status", "done")
    .gte("done_at", from)
    .lte("done_at", to);

  const orderIds = (doneOrders ?? []).map((o) => o.id);
  if (orderIds.length === 0) return [];

  const { data: items, error } = await supabase
    .from("sales_order_items")
    .select("product_id, name_snapshot_en, qty, line_total, cogs_total")
    .in("sales_order_id", orderIds);

  if (error) {
    console.error("getTopSellingProducts:", error.message);
    return [];
  }

  const map = new Map<string, TopProductRow>();
  for (const item of items ?? []) {
    const existing = map.get(item.product_id);
    const revenue = item.line_total;
    const cogs = item.cogs_total ?? 0;
    if (existing) {
      existing.revenue += revenue;
      existing.cogs += cogs;
      existing.margin += revenue - cogs;
      existing.qtySold += item.qty;
    } else {
      map.set(item.product_id, {
        productId: item.product_id,
        name: item.name_snapshot_en,
        revenue,
        cogs,
        margin: revenue - cogs,
        qtySold: item.qty,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
