"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { upsertCustomerAction } from "@/app/actions/customers";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Customer } from "@/lib/types";

export function CustomerForm({ dict, initial }: { dict: Dictionary; initial?: Customer }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    name_ar: initial?.name_ar ?? "",
    vat_number: initial?.vat_number ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    address_line: initial?.address_line ?? "",
    city: initial?.city ?? "",
    notes: initial?.notes ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await upsertCustomerAction({ id: initial?.id, ...form });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(dict.common.save);
      router.push("/customers");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-xl border bg-card p-6 space-y-4 max-w-2xl">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{dict.customers.name} <span className="text-destructive">*</span></Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>{dict.customers.nameAr}</Label>
          <Input value={form.name_ar ?? ""} onChange={(e) => set("name_ar", e.target.value)} dir="rtl" />
        </div>
        <div className="space-y-2">
          <Label>{dict.customers.vatNumber}</Label>
          <Input value={form.vat_number ?? ""} onChange={(e) => set("vat_number", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{dict.customers.email}</Label>
          <Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{dict.customers.phone}</Label>
          <Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>{dict.customers.city}</Label>
          <Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label>{dict.onboarding.address}</Label>
          <Input value={form.address_line ?? ""} onChange={(e) => set("address_line", e.target.value)} />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label>{dict.common.notes}</Label>
          <Textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
        </div>
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
