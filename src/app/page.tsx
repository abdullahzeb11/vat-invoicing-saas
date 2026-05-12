import Link from "next/link";
import { ArrowRight, FileText, Package, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function LandingPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">
            {t.common.appName}
          </Link>
          <div className="flex items-center gap-1">
            <LocaleToggle current={locale} />
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">{t.landing.ctaSignIn}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">
                {t.landing.ctaStart}
                <ArrowRight className="h-4 w-4 ms-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{t.landing.heroTitle}</h1>
          <p className="mt-5 text-lg text-muted-foreground md:text-xl">{t.landing.heroSub}</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">{t.landing.ctaStart}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">{t.landing.ctaSignIn}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard icon={<FileText className="h-5 w-5" />} title={t.landing.featureA} body={t.landing.featureADesc} />
          <FeatureCard icon={<Package className="h-5 w-5" />} title={t.landing.featureB} body={t.landing.featureBDesc} />
          <FeatureCard icon={<BarChart3 className="h-5 w-5" />} title={t.landing.featureC} body={t.landing.featureCDesc} />
        </div>
      </section>

      <footer className="border-t">
        <div className="container flex h-14 items-center justify-between text-sm text-muted-foreground">
          <span>{t.common.appName}</span>
          <span>{t.common.tagline}</span>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
