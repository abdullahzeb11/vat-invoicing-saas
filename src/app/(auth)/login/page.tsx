import Link from "next/link";
import { LoginForm } from "./login-form";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function LoginPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            {t.common.appName}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{t.auth.signInTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.auth.signInSubtitle}</p>
        </div>
        <LoginForm dict={t} />
        <p className="text-center text-sm text-muted-foreground">
          {t.auth.noAccount}{" "}
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            {t.auth.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}
