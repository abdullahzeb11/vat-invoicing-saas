import { Suspense } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { ListBodySkeleton } from "@/components/app/list-skeleton";
import { CustomerRowActions } from "./row-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/org-context";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import type { Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const t = getDictionary(await getLocale());
  return (
    <div>
      <PageHeader
        title={t.customers.title}
        action={
          <Button asChild>
            <Link href="/customers/new">
              <Plus className="h-4 w-4" />
              {t.customers.new}
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<ListBodySkeleton rows={6} columns={4} />}>
        <CustomerListData dict={t} />
      </Suspense>
    </div>
  );
}

async function CustomerListData({ dict: t }: { dict: Dictionary }) {
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Customer[];

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title={t.customers.emptyTitle}
        body={t.customers.emptyBody}
        action={
          <Button asChild>
            <Link href="/customers/new">{t.customers.new}</Link>
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
              <TableHead>{t.customers.name}</TableHead>
              <TableHead>{t.customers.vatNumber}</TableHead>
              <TableHead>{t.customers.email}</TableHead>
              <TableHead>{t.customers.city}</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-medium">{c.name}</div>
                  {c.name_ar ? <div className="text-xs text-muted-foreground" dir="rtl">{c.name_ar}</div> : null}
                </TableCell>
                <TableCell className="font-mono text-xs">{c.vat_number ?? "—"}</TableCell>
                <TableCell>{c.email ?? "—"}</TableCell>
                <TableCell>{c.city ?? "—"}</TableCell>
                <TableCell className="text-end">
                  <CustomerRowActions id={c.id} dict={t} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {rows.map((c) => (
          <div key={c.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{c.name}</div>
                {c.name_ar ? <div className="text-xs text-muted-foreground" dir="rtl">{c.name_ar}</div> : null}
                {c.vat_number ? (
                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">VAT {c.vat_number}</div>
                ) : null}
              </div>
              <CustomerRowActions id={c.id} dict={t} />
            </div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              {c.email ? <div className="truncate">{c.email}</div> : null}
              {c.phone ? <div>{c.phone}</div> : null}
              {c.city ? <div>{c.city}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
