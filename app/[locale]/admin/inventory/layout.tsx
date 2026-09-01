import { requireSection } from "@/lib/admin-permissions";

export default async function InventorySectionLayout({ children }: { children: React.ReactNode }) {
  await requireSection("inventory");
  return <>{children}</>;
}
