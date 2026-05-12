import { LayoutDashboard, FileText, Package, Users, Settings, type LucideIcon } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function getNavItems(dict: Dictionary): NavItem[] {
  return [
    { href: "/dashboard", label: dict.nav.dashboard, icon: LayoutDashboard },
    { href: "/invoices", label: dict.nav.invoices, icon: FileText },
    { href: "/products", label: dict.nav.products, icon: Package },
    { href: "/customers", label: dict.nav.customers, icon: Users },
    { href: "/settings", label: dict.nav.settings, icon: Settings },
  ];
}
