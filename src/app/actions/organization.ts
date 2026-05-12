"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(1).max(120),
  legal_name: z.string().max(200).optional().or(z.literal("")),
  vat_number: z.string().max(40).optional().or(z.literal("")),
  cr_number: z.string().max(40).optional().or(z.literal("")),
  address_line: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
});

export async function createOrganizationAction(input: z.infer<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Please check the form and try again." };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const organizationId = crypto.randomUUID();
  const payload = {
    id: organizationId,
    name: parsed.data.name.trim(),
    legal_name: nullIfBlank(parsed.data.legal_name),
    vat_number: nullIfBlank(parsed.data.vat_number),
    cr_number: nullIfBlank(parsed.data.cr_number),
    address_line: nullIfBlank(parsed.data.address_line),
    city: nullIfBlank(parsed.data.city),
    phone: nullIfBlank(parsed.data.phone),
    email: user.email,
  };

  const { error: orgErr } = await supabase.from("organizations").insert(payload);
  if (orgErr) return { error: orgErr.message };

  const { error: memErr } = await supabase
    .from("memberships")
    .insert({ user_id: user.id, organization_id: organizationId, role: "owner" });
  if (memErr) return { error: memErr.message };

  revalidatePath("/", "layout");
  return { ok: true, organizationId };
}

export async function updateOrganizationAction(input: {
  id: string;
  name?: string;
  legal_name?: string | null;
  vat_number?: string | null;
  cr_number?: string | null;
  address_line?: string | null;
  city?: string | null;
  phone?: string | null;
  vat_rate?: number;
  invoice_prefix?: string;
  zatca_qr_enabled?: boolean;
}) {
  const supabase = await createSupabaseServerClient();
  const { id, ...rest } = input;
  const { error } = await supabase.from("organizations").update(rest).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

function nullIfBlank(v: string | undefined | null) {
  if (!v) return null;
  const t = v.trim();
  return t.length ? t : null;
}
