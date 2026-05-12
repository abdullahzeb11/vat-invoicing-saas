import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { InvoiceForm, type InvoiceFormInitial } from "../../invoice-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/org-context";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Invoice, InvoiceItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("invoices")
    .select("*, items:invoice_items(*)")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!data) notFound();

  const inv = data as unknown as Invoice & { items: InvoiceItem[] };
  if (inv.status !== "draft") {
    redirect(`/invoices/${id}`);
  }

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

  const initial: InvoiceFormInitial = {
    id: inv.id,
    customer_id: inv.customer_id,
    issue_date: inv.issue_date,
    due_date: inv.due_date,
    vat_rate: Number(inv.vat_rate),
    notes: inv.notes,
    status: "draft",
    lines: [...(inv.items ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((it) => ({
        product_id: it.product_id,
        description: it.description,
        description_ar: it.description_ar ?? "",
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
      })),
  };

  return (
    <div>
      <PageHeader title={`${t.common.edit} · ${inv.invoice_number}`} />
      <InvoiceForm
        dict={t}
        currency={ctx.organization.currency}
        defaultVatRate={Number(ctx.organization.vat_rate)}
        customers={customers ?? []}
        products={products ?? []}
        initial={initial}
      />
    </div>
  );
}
