import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { InvoiceData } from "@/lib/data/orders";

// @react-pdf/renderer's built-in fonts (Helvetica etc.) don't include Arabic glyphs, and this
// build environment has no network access to fetch an Arabic-capable font file — so the
// invoice renders in English/Latin regardless of site locale. Swap in Font.register() with a
// bundled Arabic TTF once one is added to the project to localize this.
const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#14141f" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#5B3DF5" },
  muted: { color: "#6b7280", fontSize: 9, marginTop: 2 },
  right: { alignItems: "flex-end" },
  bold: { fontFamily: "Helvetica-Bold" },
  section: { marginBottom: 14 },
  label: { color: "#6b7280", fontSize: 9, marginBottom: 2 },
  table: { marginTop: 8 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: "#14141f",
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e2ea",
    paddingVertical: 6,
  },
  colName: { flex: 3 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", width: 200, justifyContent: "space-between", marginBottom: 4 },
  grandTotal: { fontSize: 13 },
});

function money(amount: number) {
  return `E£${amount.toFixed(2)}`;
}

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>7oor Store</Text>
            <Text style={styles.muted}>Mobile accessories, stationery & printing</Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.bold}>Invoice {data.invoiceNumber}</Text>
            <Text style={styles.muted}>Order {data.orderNumber}</Text>
            <Text style={styles.muted}>{data.issuedAt}</Text>
            <Text style={[styles.muted, styles.bold, { textTransform: "uppercase" }]}>
              {data.status}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bill to</Text>
          <Text style={styles.bold}>{data.customerName}</Text>
          {data.customerEmail ? <Text style={styles.muted}>{data.customerEmail}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Fulfillment</Text>
          <Text style={styles.bold}>
            {data.fulfillmentMethod === "delivery" ? "Delivery" : "In-store pickup"}
            {data.deliveryAddress ? ` — ${data.deliveryAddress}` : ""}
          </Text>
          <Text style={[styles.label, { marginTop: 8 }]}>Payment method</Text>
          <Text style={styles.bold}>{data.paymentMethod}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colName, styles.bold]}>Item</Text>
            <Text style={[styles.colQty, styles.bold]}>Qty</Text>
            <Text style={[styles.colPrice, styles.bold]}>Unit Price</Text>
            <Text style={[styles.colTotal, styles.bold]}>Total</Text>
          </View>
          {data.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colName}>{item.name}</Text>
              <Text style={styles.colQty}>{item.qty}</Text>
              <Text style={styles.colPrice}>{money(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{money(item.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.label}>Subtotal</Text>
            <Text>{money(data.subtotal)}</Text>
          </View>
          {data.deliveryFee > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.label}>Delivery fee</Text>
              <Text>{money(data.deliveryFee)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={[styles.label, styles.grandTotal]}>Total</Text>
            <Text style={[styles.bold, styles.grandTotal]}>{money(data.total)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
