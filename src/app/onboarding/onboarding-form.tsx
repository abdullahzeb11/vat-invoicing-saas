"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createOrganizationAction } from "@/app/actions/organization";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function OnboardingForm({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    name: "",
    legal_name: "",
    vat_number: "",
    cr_number: "",
    address_line: "",
    city: "",
    phone: "",
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await createOrganizationAction(form);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-xl border bg-card p-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={dict.onboarding.orgName} required>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </Field>
        <Field label={dict.onboarding.orgNameAr}>
          <Input value={form.legal_name} onChange={(e) => set("legal_name", e.target.value)} dir="auto" />
        </Field>
        <Field label={dict.onboarding.vatNumber}>
          <Input value={form.vat_number} onChange={(e) => set("vat_number", e.target.value)} />
        </Field>
        <Field label={dict.onboarding.crNumber}>
          <Input value={form.cr_number} onChange={(e) => set("cr_number", e.target.value)} />
        </Field>
        <Field label={dict.onboarding.address}>
          <Input value={form.address_line} onChange={(e) => set("address_line", e.target.value)} />
        </Field>
        <Field label={dict.onboarding.city}>
          <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label={dict.onboarding.phone}>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        {pending ? dict.common.loading : dict.onboarding.finish}
      </Button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-destructive ms-1">*</span> : null}
      </Label>
      {children}
    </div>
  );
}
