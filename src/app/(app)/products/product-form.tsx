"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { upsertProductAction } from "@/app/actions/products";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Product } from "@/lib/types";

export function ProductForm({ dict, initial }: { dict: Dictionary; initial?: Product }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    sku: initial?.sku ?? "",
    name: initial?.name ?? "",
    name_ar: initial?.name_ar ?? "",
    description: initial?.description ?? "",
    unit: initial?.unit ?? "unit",
    unit_price: initial?.unit_price ?? 0,
    stock_qty: initial?.stock_qty ?? 0,
    is_active: initial?.is_active ?? true,
  });

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await upsertProductAction({ id: initial?.id, ...form });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(dict.common.save);
      router.push("/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-xl border bg-card p-6 space-y-4 max-w-2xl">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{dict.products.sku}</Label>
          <Input value={form.sku ?? ""} onChange={(e) => set("sku", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{dict.products.unit}</Label>
          <Input value={form.unit} onChange={(e) => set("unit", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>
            {dict.products.name} <span className="text-destructive">*</span>
          </Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>{dict.products.nameAr}</Label>
          <Input value={form.name_ar ?? ""} onChange={(e) => set("name_ar", e.target.value)} dir="rtl" />
        </div>
        <div className="space-y-2">
          <Label>{dict.products.price}</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.unit_price === 0 ? "" : form.unit_price}
            onFocus={(e) => e.target.select()}
            onChange={(e) =>
              set("unit_price", e.target.value === "" ? 0 : Number(e.target.value))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>{dict.products.stock}</Label>
          <Input
            type="number"
            min={0}
            step="1"
            value={form.stock_qty === 0 ? "" : form.stock_qty}
            onFocus={(e) => e.target.select()}
            onChange={(e) =>
              set("stock_qty", e.target.value === "" ? 0 : Number(e.target.value))
            }
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label>{dict.common.notes}</Label>
          <Textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
        </div>
        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-input"
            checked={form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
          />
          <span className="text-sm">{dict.products.active}</span>
        </label>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {dict.common.cancel}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {pending ? dict.common.loading : dict.common.save}
        </Button>
      </div>
    </form>
  );
}
