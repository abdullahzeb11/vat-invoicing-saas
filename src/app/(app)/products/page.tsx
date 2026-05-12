import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { ProductRowActions } from "./row-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/org-context";
import { formatCurrency } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });

  const locale = await getLocale();
  const t = getDictionary(locale);
  const rows = (products ?? []) as Product[];

  return (
    <div>
      <PageHeader
        title={t.products.title}
        action={
          <Button asChild>
            <Link href="/products/new">
              <Plus className="h-4 w-4" />
              {t.products.new}
            </Link>
          </Button>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title={t.products.emptyTitle}
          body={t.products.emptyBody}
          action={
            <Button asChild>
              <Link href="/products/new">{t.products.new}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="hidden md:block rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.products.sku}</TableHead>
                  <TableHead>{t.products.name}</TableHead>
                  <TableHead className="text-end">{t.products.price}</TableHead>
                  <TableHead className="text-end">{t.products.stock}</TableHead>
                  <TableHead>{t.products.active}</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.sku ?? "—"}</TableCell>
                    <TableCell>
                      <div className="font-medium">{p.name}</div>
                      {p.name_ar ? <div className="text-xs text-muted-foreground" dir="rtl">{p.name_ar}</div> : null}
                    </TableCell>
                    <TableCell className="text-end">{formatCurrency(p.unit_price, ctx.organization.currency)}</TableCell>
                    <TableCell className="text-end">{p.stock_qty}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_active ? "success" : "muted"}>
                        {p.is_active ? t.common.yes : t.common.no}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <ProductRowActions id={p.id} dict={t} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-3">
            {rows.map((p) => (
              <div key={p.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{p.name}</div>
                    {p.name_ar ? <div className="text-xs text-muted-foreground" dir="rtl">{p.name_ar}</div> : null}
                    {p.sku ? <div className="mt-1 font-mono text-[11px] text-muted-foreground">SKU {p.sku}</div> : null}
                  </div>
                  <ProductRowActions id={p.id} dict={t} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrency(p.unit_price, ctx.organization.currency)}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      {t.products.stock}: {p.stock_qty}
                    </span>
                  </div>
                  <Badge variant={p.is_active ? "success" : "muted"}>
                    {p.is_active ? t.common.yes : t.common.no}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
