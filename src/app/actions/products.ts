"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/org-context";

const productSchema = z.object({
  sku: z.string().max(60).optional().or(z.literal("")),
  name: z.string().min(1, "Name is required").max(200),
  name_ar: z.string().max(200).optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
  unit: z.string().max(40).default("unit"),
  unit_price: z.coerce.number().min(0),
  stock_qty: z.coerce.number().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

export async function upsertProductAction(input: ProductInput & { id?: string }) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();

  const payload = {
    organization_id: ctx.organization.id,
    sku: nullIfBlank(parsed.data.sku),
    name: parsed.data.name.trim(),
    name_ar: nullIfBlank(parsed.data.name_ar),
    description: nullIfBlank(parsed.data.description),
    unit: parsed.data.unit || "unit",
    unit_price: parsed.data.unit_price,
    stock_qty: parsed.data.stock_qty,
    is_active: parsed.data.is_active,
  };

  if (input.id) {
    const { error } = await supabase.from("products").update(payload).eq("id", input.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("products").insert(payload);
    if (error) return { error: error.message };
  }
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteProductAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/products");
  return { ok: true };
}

function nullIfBlank(v: string | undefined | null) {
  if (!v) return null;
  const t = v.trim();
  return t.length ? t : null;
}
