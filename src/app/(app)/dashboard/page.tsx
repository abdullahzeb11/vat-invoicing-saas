import Link from "next/link";
import { ArrowUpRight, FileText, Package, Coins, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { RevenueChart } from "./revenue-chart";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/org-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Invoice, Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

const statusVariant: Record<Invoice["status"], "muted" | "warning" | "success" | "destructive"> = {
  draft: "muted",
  sent: "warning",
  paid: "success",
  void: "destructive",
};

export default async function DashboardPage() {
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1).toISOString().slice(0, 10);

  const [{ data: invoices }, { count: invoiceCount }, { count: productCount }] = await Promise.all([
    supabase
      .from("invoices")
      .select("*, customer:customers(name)")
      .eq("organization_id", ctx.organization.id)
      .neq("status", "void")
      .gte("issue_date", sixMonthsAgo)
      .order("issue_date", { ascending: false }),
    supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", ctx.organization.id)
      .gte("issue_date", monthStart)
      .neq("status", "void"),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", ctx.organization.id),
  ]);

  const list = (invoices ?? []) as (Invoice & { customer: { name: string } | null })[];
  const monthInvoices = list.filter((i) => i.issue_date >= monthStart);
  const revenueThisMonth = monthInvoices.reduce((s, i) => s + Number(i.total), 0);
  const outstanding = list.filter((i) => i.status === "sent").reduce((s, i) => s + Number(i.total), 0);
  const paid = list.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);

  const monthly = buildMonthlySeries(list, 6, ctx.organization.currency);

  const recent = list.slice(0, 5);

  const t = getDictionary(await getLocale());

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.dashboard.title}
        action={
          <Button asChild>
            <Link href="/invoices/new">
              {t.invoices.new}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Coins className="h-4 w-4" />} label={t.dashboard.revenueThisMonth} value={formatCurrency(revenueThisMonth, ctx.organization.currency)} />
        <Stat icon={<FileText className="h-4 w-4" />} label={t.dashboard.invoicesThisMonth} value={String(invoiceCount ?? 0)} />
        <Stat icon={<Inbox className="h-4 w-4" />} label={t.dashboard.outstanding} value={formatCurrency(outstanding, ctx.organization.currency)} />
        <Stat icon={<Package className="h-4 w-4" />} label={t.dashboard.inventoryItems} value={String(productCount ?? 0)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.dashboard.monthlyRevenue}</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={monthly} currency={ctx.organization.currency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.paid}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="break-all text-2xl font-semibold tracking-tight md:text-3xl">
              {formatCurrency(paid, ctx.organization.currency)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.dashboard.revenue}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard.recentInvoices}</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState title={t.dashboard.noInvoices} action={<Button asChild><Link href="/invoices/new">{t.invoices.new}</Link></Button>} />
          ) : (
            <>
              <div className="hidden md:block">
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
                    {recent.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>
                          <Link href={`/invoices/${i.id}`} className="font-mono text-xs hover:underline">
                            {i.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell>{i.customer?.name ?? "—"}</TableCell>
                        <TableCell>{formatDate(i.issue_date)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[i.status]}>{t.invoices.status[i.status]}</Badge>
                        </TableCell>
                        <TableCell className="text-end font-medium">
                          {formatCurrency(i.total, ctx.organization.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden -mx-2 space-y-2">
                {recent.map((i) => (
                  <Link
                    key={i.id}
                    href={`/invoices/${i.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-3 transition-colors hover:bg-accent/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[11px] text-muted-foreground">{i.invoice_number}</div>
                      <div className="mt-0.5 truncate text-sm font-medium">{i.customer?.name ?? "—"}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(i.issue_date)}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-sm font-semibold">
                        {formatCurrency(i.total, ctx.organization.currency)}
                      </span>
                      <Badge variant={statusVariant[i.status]}>{t.invoices.status[i.status]}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
          <span className="text-muted-foreground">{icon}</span>
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

function buildMonthlySeries(
  invoices: Pick<Invoice, "issue_date" | "total" | "status">[],
  months: number,
  _currency: string
) {
  const out: { label: string; total: number }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const from = d.toISOString().slice(0, 10);
    const to = next.toISOString().slice(0, 10);
    const sum = invoices
      .filter((inv) => inv.issue_date >= from && inv.issue_date < to && inv.status !== "void")
      .reduce((s, inv) => s + Number(inv.total), 0);
    out.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      total: Math.round(sum * 100) / 100,
    });
  }
  return out;
}
