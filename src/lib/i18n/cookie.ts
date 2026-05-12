import { cookies } from "next/headers";
import { type Locale, defaultLocale, locales } from "./dictionaries";

const COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  if (value && (locales as readonly string[]).includes(value)) {
    return value as Locale;
  }
  return defaultLocale;
}
