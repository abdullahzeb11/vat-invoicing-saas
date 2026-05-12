"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { MobileNav } from "@/components/app/mobile-nav";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function Topbar({
  dict,
  email,
  locale,
  orgName,
}: {
  dict: Dictionary;
  email: string;
  locale: Locale;
  orgName: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSignOut() {
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return;
      }
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <MobileNav dict={dict} orgName={orgName} />
        <span className="text-sm font-semibold">{dict.common.appName}</span>
      </div>
      <div className="ms-auto flex items-center gap-1">
        <LocaleToggle current={locale} />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="font-normal max-w-[160px] sm:max-w-none">
              <span className="truncate">{email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={pending}
              onSelect={(e) => {
                e.preventDefault();
                handleSignOut();
              }}
              className="cursor-pointer"
            >
              <LogOut className="h-4 w-4 me-2" />
              {dict.nav.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
