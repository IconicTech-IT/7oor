import { requireSection } from "@/lib/admin-permissions";

export default async function CategoriesSectionLayout({ children }: { children: React.ReactNode }) {
  await requireSection("categories");
  return <>{children}</>;
}
