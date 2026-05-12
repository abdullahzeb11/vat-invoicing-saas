import { PageHeader } from "@/components/app/page-header";
import { InvoiceForm } from "../invoice-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/org-context";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();
  const [{ data: customers }, { data: products }] = await Promise.all([
    supabase
      .from("customers")
      .select("id,name,name_ar,vat_number")
      .eq("organization_id", ctx.organization.id)
      .order("name"),
    supabase
      .from("products")
      .select("id,name,name_ar,unit_price")
      .eq("organization_id", ctx.organization.id)
      .eq("is_active", true)
      .order("name"),
  ]);
  const t = getDictionary(await getLocale());

  return (
    <div>
      <PageHeader title={t.invoices.new} />
      <InvoiceForm
        dict={t}
        currency={ctx.organization.currency}
        defaultVatRate={Number(ctx.organization.vat_rate)}
        customers={customers ?? []}
        products={products ?? []}
      />
    </div>
  );
}
