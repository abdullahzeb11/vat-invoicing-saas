import { Suspense } from "react";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { ListBodySkeleton } from "@/components/app/list-skeleton";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/org-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import type { Invoice, Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

type Row = Invoice & { customer: Customer | null };

const statusVariant: Record<Invoice["status"], "muted" | "warning" | "success" | "destructive"> = {
  draft: "muted",
  sent: "warning",
  paid: "success",
  void: "destructive",
};

export default async function InvoicesPage() {
  const t = getDictionary(await getLocale());
  return (
    <div>
      <PageHeader
        title={t.invoices.title}
        action={
          <Button asChild>
            <Link href="/invoices/new">
              <Plus className="h-4 w-4" />
              {t.invoices.new}
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<ListBodySkeleton rows={6} columns={5} />}>
        <InvoiceListData dict={t} />
      </Suspense>
    </div>
  );
}

async function InvoiceListData({ dict: t }: { dict: Dictionary }) {
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("invoices")
    .select("*, customer:customers(*)")
    .eq("organization_id", ctx.organization.id)
    .order("issue_date", { ascending: false })
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Row[];
  const currency = ctx.organization.currency;

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title={t.invoices.emptyTitle}
        body={t.invoices.emptyBody}
        action={
          <Button asChild>
            <Link href="/invoices/new">{t.invoices.new}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="hidden md:block rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.invoices.number}</TableHead>
              <TableHead>{t.invoices.customer}</TableHead>
              <TableHead>{t.invoices.issueDate}</TableHead>
              <TableHead>{t.common.status}</TableHead>
              <TableHead className="text-end">{t.invoices.amount}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/invoices/${inv.id}`} className="font-mono text-xs hover:underline">
                    {inv.invoice_number}
                  </Link>
                </TableCell>
                <TableCell>{inv.customer?.name ?? "—"}</TableCell>
                <TableCell>{formatDate(inv.issue_date)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[inv.status]}>{t.invoices.status[inv.status]}</Badge>
                </TableCell>
                <TableCell className="text-end font-medium">
                  {formatCurrency(inv.total, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {rows.map((inv) => (
          <Link
            key={inv.id}
            href={`/invoices/${inv.id}`}
            className="block rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-mono text-xs text-muted-foreground">{inv.invoice_number}</div>
                <div className="mt-1 truncate font-medium">{inv.customer?.name ?? "—"}</div>
                <div className="mt-1 text-xs text-muted-foreground">{formatDate(inv.issue_date)}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="font-semibold">{formatCurrency(inv.total, currency)}</div>
                <Badge variant={statusVariant[inv.status]}>{t.invoices.status[inv.status]}</Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

