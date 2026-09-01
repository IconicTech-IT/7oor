import { requireSection } from "@/lib/admin-permissions";

export default async function OrdersSectionLayout({ children }: { children: React.ReactNode }) {
  await requireSection("orders");
  return <>{children}</>;
}
