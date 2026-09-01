import { requireSection } from "@/lib/admin-permissions";

export default async function RequestsSectionLayout({ children }: { children: React.ReactNode }) {
  await requireSection("requests");
  return <>{children}</>;
}
