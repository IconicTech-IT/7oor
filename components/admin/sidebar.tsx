import {
  LayoutGrid,
  Package,
  FolderTree,
  ShoppingCart,
  Warehouse,
  Truck,
  Wallet,
  Settings,
  MessageSquareText,
  Users,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/layout/logo";

type Role = "admin" | "staff";
type NavItem = { href: string; labelKey: string; icon: typeof LayoutGrid; roles: Role[] };

const NAV: NavItem[] = [
  { href: "/admin", labelKey: "dashboard", icon: LayoutGrid, roles: ["admin", "staff"] },
  { href: "/admin/products", labelKey: "products", icon: Package, roles: ["admin", "staff"] },
  { href: "/admin/categories", labelKey: "categories", icon: FolderTree, roles: ["admin", "staff"] },
  { href: "/admin/orders", labelKey: "orders", icon: ShoppingCart, roles: ["admin", "staff"] },
  { href: "/admin/requests", labelKey: "requests", icon: MessageSquareText, roles: ["admin", "staff"] },
  { href: "/admin/inventory", labelKey: "inventory", icon: Warehouse, roles: ["admin", "staff"] },
  { href: "/admin/purchases", labelKey: "purchases", icon: Truck, roles: ["admin", "staff"] },
  { href: "/admin/accounting", labelKey: "accounting", icon: Wallet, roles: ["admin"] },
  { href: "/admin/staff", labelKey: "staff", icon: Users, roles: ["admin"] },
  { href: "/admin/settings", labelKey: "settings", icon: Settings, roles: ["admin"] },
];

export async function AdminSidebar({ role }: { role: string }) {
  const t = await getTranslations("admin");
  const items = NAV.filter((item) => item.roles.includes(role as Role));

  return (
    <aside className="hidden w-60 shrink-0 border-e border-border bg-card lg:block">
      <div className="p-5">
        <Logo />
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
          {t("sidebarLabel")}
        </p>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <item.icon className="h-4 w-4" />
            {t(`nav.${item.labelKey}`)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
