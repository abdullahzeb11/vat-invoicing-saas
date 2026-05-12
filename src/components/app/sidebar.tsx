"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/nav-items";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Sidebar({ dict, orgName }: { dict: Dictionary; orgName: string }) {
  const pathname = usePathname();
  const items = getNavItems(dict);

  return (
    <aside className="hidden w-60 shrink-0 border-e bg-card/30 md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary/15 text-primary grid place-items-center text-xs font-bold">F</div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">{dict.common.appName}</span>
            <span className="text-[11px] text-muted-foreground line-clamp-1">{orgName}</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
