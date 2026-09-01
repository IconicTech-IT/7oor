import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { getPurchaseBillData } from "@/lib/data/purchases";
import { PurchaseBillDocument } from "@/lib/pdf/PurchaseBillDocument";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // getPurchaseBillData relies on purchase_orders RLS to scope this to staff/admin — it
  // returns null for anyone else, same as a 404.
  const data = await getPurchaseBillData(id);
  if (!data) {
    return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(<PurchaseBillDocument data={data} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${data.poNumber}.pdf"`,
    },
  });
}
