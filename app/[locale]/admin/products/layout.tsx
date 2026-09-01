import { requireSection } from "@/lib/admin-permissions";

export default async function ProductsSectionLayout({ children }: { children: React.ReactNode }) {
  await requireSection("products");
  return <>{children}</>;
}
