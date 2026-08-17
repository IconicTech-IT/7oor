import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { getInvoiceData } from "@/lib/data/orders";
import { InvoiceDocument } from "@/lib/pdf/InvoiceDocument";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // getInvoiceData relies on sales_orders/invoices RLS to scope this to the order's
  // owner or staff/admin — it returns null for anyone else, same as a 404.
  const data = await getInvoiceData(id);
  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(<InvoiceDocument data={data} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${data.invoiceNumber}.pdf"`,
    },
  });
}
