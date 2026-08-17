import { getSuppliers } from "@/lib/data/purchases";
import { getAllProductsAdmin } from "@/lib/data/products";
import { PurchaseOrderForm } from "@/components/admin/purchase-order-form";

export const dynamic = "force-dynamic";

export default async function NewPurchaseOrderPage() {
  const [suppliers, products] = await Promise.all([getSuppliers(), getAllProductsAdmin()]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">New Purchase Order</h1>
      <div className="mt-6">
        <PurchaseOrderForm
          suppliers={suppliers}
          products={products.filter((p) => p.type === "simple")}
        />
      </div>
    </div>
  );
}
