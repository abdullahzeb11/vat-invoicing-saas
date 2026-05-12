import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { requireOrgContext } from "@/lib/org-context";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // requireOrgContext throws NEXT_REDIRECT internally (to /login or /onboarding).
  // Don't wrap it in .catch — that would swallow the redirect signal.
  const ctx = await requireOrgContext();
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <Sidebar dict={t} orgName={ctx.organization.name} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar dict={t} email={ctx.email} locale={locale} orgName={ctx.organization.name} />
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
