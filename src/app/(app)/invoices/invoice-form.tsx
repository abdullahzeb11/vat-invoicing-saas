"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvoiceAction, updateInvoiceAction } from "@/app/actions/invoices";
import { computeInvoiceTotals } from "@/lib/invoice-math";
import { formatCurrency } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface CustomerOption {
  id: string;
  name: string;
  name_ar: string | null;
}
interface ProductOption {
  id: string;
  name: string;
  name_ar: string | null;
  unit_price: number;
}

interface Line {
  product_id: string | null;
  description: string;
  description_ar: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceFormInitial {
  id: string;
  customer_id: string | null;
  issue_date: string;
  due_date: string | null;
  vat_rate: number;
  notes: string | null;
  status: "draft" | "sent" | "paid";
  lines: Line[];
}

const NONE = "__none__";

export function InvoiceForm({
  dict,
  currency,
  defaultVatRate,
  customers,
  products,
  initial,
}: {
  dict: Dictionary;
  currency: string;
  defaultVatRate: number;
  customers: CustomerOption[];
  products: ProductOption[];
  initial?: InvoiceFormInitial;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [pending, start] = useTransition();
  const [customerId, setCustomerId] = useState<string | null>(initial?.customer_id ?? null);
  const [issueDate, setIssueDate] = useState(initial?.issue_date ?? new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState<string>(initial?.due_date ?? "");
  const [vatRate, setVatRate] = useState<number>(initial?.vat_rate ?? defaultVatRate);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [status, setStatus] = useState<"draft" | "sent" | "paid">(initial?.status ?? "draft");
  const [lines, setLines] = useState<Line[]>(
    initial?.lines.length
      ? initial.lines
      : [{ product_id: null, description: "", description_ar: "", quantity: 1, unit_price: 0 }]
  );

  const totals = useMemo(() => computeInvoiceTotals(lines, vatRate), [lines, vatRate]);

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((prev) => [
      ...prev,
      { product_id: null, description: "", description_ar: "", quantity: 1, unit_price: 0 },
    ]);
  }
  function removeLine(i: number) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }
  function pickProduct(i: number, productId: string) {
    const p = products.find((p) => p.id === productId);
    if (!p) return;
    updateLine(i, {
      product_id: p.id,
      description: p.name,
      description_ar: p.name_ar ?? "",
      unit_price: Number(p.unit_price) || 0,
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.some((l) => !l.description.trim() || l.quantity <= 0)) {
      toast.error("Add a description and quantity for each line.");
      return;
    }
    start(async () => {
      const payload = {
        customer_id: customerId,
        issue_date: issueDate,
        due_date: dueDate || null,
        notes: notes || null,
        vat_rate: vatRate,
        status,
        lines: lines.map((l) => ({
          product_id: l.product_id,
          description: l.description.trim(),
          description_ar: l.description_ar.trim() || null,
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
      };
      const res = isEdit && initial
        ? await updateInvoiceAction(initial.id, payload)
        : await createInvoiceAction(payload);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(dict.common.save);
      router.push(`/invoices/${res.invoiceId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6 pb-24 lg:pb-0">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{dict.invoices.customer}</Label>
              <Select
                value={customerId ?? NONE}
                onValueChange={(v) => setCustomerId(v === NONE ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={dict.invoices.pickCustomer} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>—</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isEdit ? null : (
              <div className="space-y-2">
                <Label>{dict.common.status}</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{dict.invoices.status.draft}</SelectItem>
                    <SelectItem value="sent">{dict.invoices.status.sent}</SelectItem>
                    <SelectItem value="paid">{dict.invoices.status.paid}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>{dict.invoices.issueDate}</Label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>{dict.common.dueDate}</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{dict.invoices.description}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="h-4 w-4" />
                {dict.invoices.addItem}
              </Button>
            </div>
            <div className="space-y-3">
              {lines.map((line, i) => {
                const computed = totals.lines[i];
                return (
                  <div key={i} className="rounded-lg border p-3 space-y-3">
                    <div className="grid gap-2 md:grid-cols-12">
                      <div className="md:col-span-3">
                        <Label className="text-xs text-muted-foreground">{dict.invoices.pickProduct}</Label>
                        <Select
                          value={line.product_id ?? NONE}
                          onValueChange={(v) => (v === NONE ? updateLine(i, { product_id: null }) : pickProduct(i, v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>—</SelectItem>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-5">
                        <Label className="text-xs text-muted-foreground">{dict.invoices.description}</Label>
                        <Input
                          value={line.description}
                          onChange={(e) => updateLine(i, { description: e.target.value })}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">{dict.invoices.quantity}</Label>
                        <Input
                          type="number"
                          min={0}
                          step="1"
                          value={line.quantity === 0 ? "" : line.quantity}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            updateLine(i, { quantity: e.target.value === "" ? 0 : Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs text-muted-foreground">{dict.invoices.unitPrice}</Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.unit_price === 0 ? "" : line.unit_price}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            updateLine(i, { unit_price: e.target.value === "" ? 0 : Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        placeholder="الوصف بالعربية (اختياري)"
                        dir="rtl"
                        value={line.description_ar}
                        onChange={(e) => updateLine(i, { description_ar: e.target.value })}
                        className="max-w-md"
                      />
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{dict.invoices.lineTotal}:</span>
                        <span className="font-medium text-foreground">{formatCurrency(computed?.line_total ?? 0, currency)}</span>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(i)} aria-label={dict.invoices.removeItem}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label>{dict.common.notes}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <aside className="rounded-xl border bg-card p-6 space-y-4 h-fit">
          <div className="space-y-2">
            <Label>{dict.common.vatRate} (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={vatRate}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setVatRate(e.target.value === "" ? 0 : Number(e.target.value))}
            />
          </div>
          <div className="border-t pt-4 space-y-2 text-sm">
            <Row label={dict.common.subtotal} value={formatCurrency(totals.subtotal, currency)} />
            <Row
              label={`${dict.common.vat} (${vatRate}%)`}
              value={formatCurrency(totals.vat_total, currency)}
            />
            <div className="border-t pt-3 flex items-center justify-between font-medium">
              <span>{dict.common.total}</span>
              <span>{formatCurrency(totals.total, currency)}</span>
            </div>
          </div>
          <Button type="submit" className="hidden lg:flex w-full" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {pending ? dict.common.loading : isEdit ? dict.common.save : dict.common.create}
          </Button>
        </aside>
      </div>

      {/* Sticky mobile/tablet action bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {dict.common.total}
            </div>
            <div className="truncate text-lg font-semibold">
              {formatCurrency(totals.total, currency)}
            </div>
          </div>
          <Button type="submit" disabled={pending} className="min-w-[8rem]">
            {pending ? <Loader2 className="animate-spin" /> : null}
            {pending ? dict.common.loading : isEdit ? dict.common.save : dict.common.create}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
