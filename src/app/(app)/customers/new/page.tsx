import { PageHeader } from "@/components/app/page-header";
import { CustomerForm } from "../customer-form";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function NewCustomerPage() {
  const t = getDictionary(await getLocale());
  return (
    <div>
      <PageHeader title={t.customers.new} />
      <CustomerForm dict={t} />
    </div>
  );
}
