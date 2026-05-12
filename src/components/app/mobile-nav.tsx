"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/nav-items";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function MobileNav({ dict, orgName }: { dict: Dictionary; orgName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = getNavItems(dict);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex items-center gap-2 pb-2 border-b">
          <div className="h-7 w-7 rounded-md bg-primary/15 text-primary grid place-items-center text-xs font-bold">
            F
          </div>
          <div className="flex flex-col leading-tight">
            <SheetTitle>{dict.common.appName}</SheetTitle>
            <span className="text-[11px] text-muted-foreground line-clamp-1">{orgName}</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
