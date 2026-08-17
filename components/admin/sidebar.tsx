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
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/layout/logo";

type Role = "admin" | "staff";
type NavItem = { href: string; label: string; icon: typeof LayoutGrid; roles: Role[] };

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid, roles: ["admin", "staff"] },
  { href: "/admin/products", label: "Products", icon: Package, roles: ["admin", "staff"] },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, roles: ["admin", "staff"] },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, roles: ["admin", "staff"] },
  { href: "/admin/requests", label: "Requests", icon: MessageSquareText, roles: ["admin", "staff"] },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse, roles: ["admin", "staff"] },
  { href: "/admin/purchases", label: "Purchases", icon: Truck, roles: ["admin", "staff"] },
  { href: "/admin/accounting", label: "Accounting", icon: Wallet, roles: ["admin"] },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["admin"] },
];

export function AdminSidebar({ role }: { role: string }) {
  const items = NAV.filter((item) => item.roles.includes(role as Role));

  return (
    <aside className="hidden w-60 shrink-0 border-e border-border bg-card lg:block">
      <div className="p-5">
        <Logo />
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">Admin</p>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
