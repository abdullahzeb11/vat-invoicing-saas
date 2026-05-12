import { PageHeader } from "@/components/app/page-header";
import { SettingsForm } from "./settings-form";
import { requireOrgContext } from "@/lib/org-context";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function SettingsPage() {
  const ctx = await requireOrgContext();
  const t = getDictionary(await getLocale());
  return (
    <div>
      <PageHeader title={t.settings.title} />
      <SettingsForm dict={t} organization={ctx.organization} />
    </div>
  );
}
