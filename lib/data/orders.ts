import { createClient } from "@/lib/supabase/server";

export async function getMyOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("sales_orders")
    .select("*, invoice:invoices(*)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) console.error("getMyOrders:", error.message);
  return data ?? [];
}

export async function getOrderDetail(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales_orders")
    .select("*, invoice:invoices(*), items:sales_order_items(*)")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("getOrderDetail:", error.message);
    return null;
  }
  return data;
}

/**
 * Staff/admin view — RLS on sales_orders already scopes SELECT to staff/admin + owner.
 * `from`/`to` (YYYY-MM-DD) narrow to orders created in that range — pass the same value for
 * both to get a single day.
 */
export async function getAllOrdersAdmin(from?: string, to?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("sales_orders")
    .select("*, invoice:invoices(*), items:sales_order_items(*)")
    .order("created_at", { ascending: false });

  if (from) query = query.gte("created_at", `${from}T00:00:00`);
  if (to) query = query.lte("created_at", `${to}T23:59:59.999`);

  const { data, error } = await query;

  if (error) console.error("getAllOrdersAdmin:", error.message);
  return data ?? [];
}

export async function getOrderDetailAdmin(orderId: string) {
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("sales_orders")
    .select("*, invoice:invoices(*), items:sales_order_items(*)")
    .eq("id", orderId)
    .single();

  if (error || !order) return null;

  const { data: customer } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", order.customer_id)
    .single();

  return { ...order, customer };
}

export async function getSalesReturns(salesOrderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales_returns")
    .select(
      "*, items:sales_return_items(*, product:products(name_en, name_ar), variant:product_variants(name_en, name_ar))",
    )
    .eq("sales_order_id", salesOrderId)
    .order("created_at", { ascending: false });
  if (error) console.error("getSalesReturns:", error.message);
  return data ?? [];
}

export type InvoiceData = {
  invoiceNumber: string;
  orderNumber: string;
  issuedAt: string;
  status: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; qty: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  fulfillmentMethod: string;
  deliveryAddress: string | null;
  paymentMethod: string;
};

/** RLS on sales_orders/invoices already restricts this to the order's owner or staff/admin. */
export async function getInvoiceData(orderId: string): Promise<InvoiceData | null> {
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("sales_orders")
    .select("*, invoice:invoices(*), items:sales_order_items(*)")
    .eq("id", orderId)
    .single();

  if (error || !order || !order.invoice) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", order.customer_id)
    .single();

  const {
    data: { user: caller },
  } = await supabase.auth.getUser();

  return {
    invoiceNumber: order.invoice.invoice_number,
    orderNumber: order.order_number,
    issuedAt: new Date(order.invoice.issued_at).toLocaleDateString("en-GB"),
    status: order.invoice.status,
    customerName: profile?.full_name ?? "Customer",
    customerEmail: caller?.id === order.customer_id ? (caller?.email ?? "") : "",
    items: order.items.map((i) => ({
      name: i.name_snapshot_en,
      qty: i.qty,
      unitPrice: i.unit_price,
      lineTotal: i.line_total,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    discount: order.discount,
    total: order.total,
    fulfillmentMethod: order.fulfillment_method,
    deliveryAddress: order.delivery_address,
    paymentMethod: order.payment_method,
  };
}
