import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { PurchaseBillData } from "@/lib/data/purchases";

// See InvoiceDocument.tsx for why this renders in English/Latin regardless of site locale.
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

export function PurchaseBillDocument({ data }: { data: PurchaseBillData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>7oor Store</Text>
            <Text style={styles.muted}>Mobile accessories, stationery & printing</Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.bold}>Purchase Order {data.poNumber}</Text>
            <Text style={styles.muted}>{data.createdAt}</Text>
            <Text style={[styles.muted, styles.bold, { textTransform: "uppercase" }]}>
              {data.status}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Supplier</Text>
          <Text style={styles.bold}>{data.supplierName}</Text>
          {data.supplierPhone ? <Text style={styles.muted}>{data.supplierPhone}</Text> : null}
          {data.supplierEmail ? <Text style={styles.muted}>{data.supplierEmail}</Text> : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colName, styles.bold]}>Item</Text>
            <Text style={[styles.colQty, styles.bold]}>Qty</Text>
            <Text style={[styles.colPrice, styles.bold]}>Unit Cost</Text>
            <Text style={[styles.colTotal, styles.bold]}>Total</Text>
          </View>
          {data.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colName}>{item.name}</Text>
              <Text style={styles.colQty}>{item.qty}</Text>
              <Text style={styles.colPrice}>{money(item.unitCost)}</Text>
              <Text style={styles.colTotal}>{money(item.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={[styles.label, styles.grandTotal]}>Total</Text>
            <Text style={[styles.bold, styles.grandTotal]}>{money(data.total)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
