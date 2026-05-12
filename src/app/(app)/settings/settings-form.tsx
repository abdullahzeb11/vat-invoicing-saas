"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { updateOrganizationAction } from "@/app/actions/organization";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Organization } from "@/lib/types";

export function SettingsForm({ dict, organization }: { dict: Dictionary; organization: Organization }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    name: organization.name,
    legal_name: organization.legal_name ?? "",
    vat_number: organization.vat_number ?? "",
    cr_number: organization.cr_number ?? "",
    address_line: organization.address_line ?? "",
    city: organization.city ?? "",
    phone: organization.phone ?? "",
    vat_rate: Number(organization.vat_rate),
    invoice_prefix: organization.invoice_prefix,
    zatca_qr_enabled: organization.zatca_qr_enabled,
  });

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateOrganizationAction({ id: organization.id, ...form });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(dict.settings.saved);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{dict.settings.company}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Row label={dict.onboarding.orgName}>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </Row>
            <Row label={dict.onboarding.orgNameAr}>
              <Input value={form.legal_name} onChange={(e) => set("legal_name", e.target.value)} dir="rtl" />
            </Row>
            <Row label={dict.onboarding.vatNumber}>
              <Input value={form.vat_number} onChange={(e) => set("vat_number", e.target.value)} />
            </Row>
            <Row label={dict.onboarding.crNumber}>
              <Input value={form.cr_number} onChange={(e) => set("cr_number", e.target.value)} />
            </Row>
            <Row label={dict.onboarding.address}>
              <Input value={form.address_line} onChange={(e) => set("address_line", e.target.value)} />
            </Row>
            <Row label={dict.onboarding.city}>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
            </Row>
            <Row label={dict.onboarding.phone}>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Row>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dict.settings.tax}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Row label={`${dict.settings.vatRate} (%)`}>
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={form.vat_rate}
                onFocus={(e) => e.target.select()}
                onChange={(e) => set("vat_rate", e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </Row>
            <Row label={dict.settings.invoicePrefix}>
              <Input value={form.invoice_prefix} onChange={(e) => set("invoice_prefix", e.target.value)} />
            </Row>
            <label className="flex items-center gap-2 md:col-span-2 pt-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                checked={form.zatca_qr_enabled}
                onChange={(e) => set("zatca_qr_enabled", e.target.checked)}
              />
              <span className="text-sm">{dict.settings.zatca}</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : null}
          {pending ? dict.common.loading : dict.common.save}
        </Button>
      </div>
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
