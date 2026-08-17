import {
  Smartphone,
  BatteryCharging,
  Cable,
  ShieldCheck,
  PenLine,
  BookOpen,
  Printer,
  Gift,
  ShoppingBag,
} from "lucide-react";

const ICONS: Record<string, typeof Smartphone> = {
  "mobile-accessories": Smartphone,
  chargers: BatteryCharging,
  cables: Cable,
  cases: ShieldCheck,
  stationery: PenLine,
  pens: PenLine,
  notebooks: BookOpen,
  services: Printer,
  printing: Printer,
  bundles: Gift,
};

export function getCategoryIcon(slug: string) {
  return ICONS[slug] ?? ShoppingBag;
}
