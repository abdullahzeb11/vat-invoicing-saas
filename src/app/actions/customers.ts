"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/org-context";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  name_ar: z.string().max(200).optional().or(z.literal("")),
  vat_number: z.string().max(40).optional().or(z.literal("")),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  address_line: z.string().max(300).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export async function upsertCustomerAction(input: CustomerInput & { id?: string }) {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();

  const payload = {
    organization_id: ctx.organization.id,
    name: parsed.data.name.trim(),
    name_ar: nullIfBlank(parsed.data.name_ar),
    vat_number: nullIfBlank(parsed.data.vat_number),
    email: nullIfBlank(parsed.data.email),
    phone: nullIfBlank(parsed.data.phone),
    address_line: nullIfBlank(parsed.data.address_line),
    city: nullIfBlank(parsed.data.city),
    notes: nullIfBlank(parsed.data.notes),
  };

  if (input.id) {
    const { error } = await supabase.from("customers").update(payload).eq("id", input.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("customers").insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath("/customers");
  return { ok: true };
}

export async function deleteCustomerAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/customers");
  return { ok: true };
}

function nullIfBlank(v: string | undefined | null) {
  if (!v) return null;
  const t = v.trim();
  return t.length ? t : null;
}
