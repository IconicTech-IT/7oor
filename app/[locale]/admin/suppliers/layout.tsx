import { requireSection } from "@/lib/admin-permissions";

export default async function SuppliersSectionLayout({ children }: { children: React.ReactNode }) {
  await requireSection("suppliers");
  return <>{children}</>;
}
