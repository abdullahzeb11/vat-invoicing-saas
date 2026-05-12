import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { InvoiceStatusActions } from "./status-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/org-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Invoice, InvoiceItem, Customer } from "@/lib/types";

type InvoiceJoined = Invoice & {
  customer: Customer | null;
  items: InvoiceItem[];
};

const statusVariant: Record<Invoice["status"], "muted" | "warning" | "success" | "destructive"> = {
  draft: "muted",
  sent: "warning",
  paid: "success",
  void: "destructive",
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("invoices")
    .select("*, customer:customers(*), items:invoice_items(*)")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!data) notFound();

  const invoice = data as unknown as InvoiceJoined;
  const t = getDictionary(await getLocale());
  const items = [...(invoice.items ?? [])].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4" />
            {t.common.back}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {invoice.status === "draft" ? (
            <Button asChild variant="outline">
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Pencil className="h-4 w-4" />
                {t.common.edit}
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <a href={`/invoices/${invoice.id}/print?print=1`} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" />
              {t.invoices.downloadPdf}
            </a>
          </Button>
          <InvoiceStatusActions id={invoice.id} status={invoice.status} dict={t} />
        </div>
      </div>

      <PageHeader
        title={invoice.invoice_number}
        description={
          invoice.customer
            ? `${invoice.customer.name} · ${formatDate(invoice.issue_date)}`
            : formatDate(invoice.issue_date)
        }
        action={<Badge variant={statusVariant[invoice.status]}>{t.invoices.status[invoice.status]}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t.invoices.description}</th>
                <th className="px-4 py-3 text-end font-medium w-[100px]">{t.invoices.quantity}</th>
                <th className="px-4 py-3 text-end font-medium w-[130px]">{t.invoices.unitPrice}</th>
                <th className="px-4 py-3 text-end font-medium w-[130px]">{t.invoices.lineTotal}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((line) => (
                <tr key={line.id} className="border-t">
                  <td className="px-4 py-3">
                    <div>{line.description}</div>
                    {line.description_ar ? (
                      <div className="text-xs text-muted-foreground" dir="rtl">{line.description_ar}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-end">{line.quantity}</td>
                  <td className="px-4 py-3 text-end">{formatCurrency(line.unit_price, invoice.currency)}</td>
                  <td className="px-4 py-3 text-end">{formatCurrency(line.line_total, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoice.notes ? (
            <div className="border-t p-4 text-sm text-muted-foreground">{invoice.notes}</div>
          ) : null}
        </div>

        <aside className="rounded-xl border bg-card p-6 space-y-3 h-fit text-sm">
          <SummaryRow label={t.common.subtotal} value={formatCurrency(invoice.subtotal, invoice.currency)} />
          <SummaryRow
            label={`${t.common.vat} (${invoice.vat_rate}%)`}
            value={formatCurrency(invoice.vat_total, invoice.currency)}
          />
          <div className="border-t pt-3 flex items-center justify-between font-medium text-base">
            <span>{t.common.total}</span>
            <span>{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
          {invoice.due_date ? (
            <div className="pt-2 text-muted-foreground">
              {t.common.dueDate}: {formatDate(invoice.due_date)}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
