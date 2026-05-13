"use server";

import { cookies } from "next/headers";
import { type Locale, locales } from "@/lib/i18n/dictionaries";

// Just sets the cookie. The client calls router.refresh() afterwards so we
// re-render only the current page instead of nuking the entire app cache.
export async function setLocaleAction(next: Locale) {
  if (!(locales as readonly string[]).includes(next)) return;
  const store = await cookies();
  store.set("locale", next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
