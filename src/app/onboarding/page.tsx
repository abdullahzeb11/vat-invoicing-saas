import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1);
  if (existing && existing.length > 0) redirect("/dashboard");

  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t.onboarding.title}</h1>
          <p className="text-sm text-muted-foreground">{t.onboarding.subtitle}</p>
        </div>
        <OnboardingForm dict={t} />
      </div>
    </div>
  );
}
