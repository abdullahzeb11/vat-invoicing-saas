"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setLocaleAction } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n/dictionaries";

export function LocaleToggle({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const next: Locale = current === "en" ? "ar" : "en";
  const label = next === "ar" ? "العربية" : "English";
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await setLocaleAction(next);
          router.refresh();
        })
      }
      aria-label="Toggle language"
    >
      {label}
    </Button>
  );
}
