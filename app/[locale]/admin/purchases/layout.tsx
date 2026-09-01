import { requireSection } from "@/lib/admin-permissions";

export default async function PurchasesSectionLayout({ children }: { children: React.ReactNode }) {
  await requireSection("purchases");
  return <>{children}</>;
}
