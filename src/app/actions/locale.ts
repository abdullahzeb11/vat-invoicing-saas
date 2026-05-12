"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { type Locale, locales } from "@/lib/i18n/dictionaries";

export async function setLocaleAction(next: Locale) {
  if (!(locales as readonly string[]).includes(next)) return;
  const store = await cookies();
  store.set("locale", next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
