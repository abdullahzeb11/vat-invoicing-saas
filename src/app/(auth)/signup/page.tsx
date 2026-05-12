import Link from "next/link";
import { SignupForm } from "./signup-form";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function SignupPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            {t.common.appName}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{t.auth.signUpTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.auth.signUpSubtitle}</p>
        </div>
        <SignupForm dict={t} />
        <p className="text-center text-sm text-muted-foreground">
          {t.auth.haveAccount}{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            {t.auth.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
