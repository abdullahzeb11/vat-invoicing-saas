"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/org-context";
import { computeInvoiceTotals } from "@/lib/invoice-math";

const lineSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  description: z.string().min(1).max(400),
  description_ar: z.string().max(400).nullable().optional(),
  quantity: z.coerce.number().min(0.0001),
  unit_price: z.coerce.number().min(0),
});

const invoiceSchema = z.object({
  customer_id: z.string().uuid().nullable().optional(),
  issue_date: z.string().min(1),
  due_date: z.string().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  vat_rate: z.coerce.number().min(0).max(100),
  status: z.enum(["draft", "sent", "paid", "void"]).default("draft"),
  lines: z.array(lineSchema).min(1, "At least one line item is required"),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

export async function createInvoiceAction(input: InvoiceInput) {
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid invoice" };
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();

  const totals = computeInvoiceTotals(parsed.data.lines, parsed.data.vat_rate);

  const { data: numberRow, error: numErr } = await supabase.rpc("next_invoice_number", {
    p_org: ctx.organization.id,
  });
  if (numErr || !numberRow) return { error: numErr?.message ?? "Could not allocate invoice number" };

  const invoiceNumber = numberRow as unknown as string;

  const { data: invoice, error: insErr } = await supabase
    .from("invoices")
    .insert({
      organization_id: ctx.organization.id,
      customer_id: parsed.data.customer_id ?? null,
      invoice_number: invoiceNumber,
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date ?? null,
      status: parsed.data.status,
      currency: ctx.organization.currency,
      notes: parsed.data.notes ?? null,
      subtotal: totals.subtotal,
      vat_total: totals.vat_total,
      total: totals.total,
      vat_rate: parsed.data.vat_rate,
    })
    .select("*")
    .single();
  if (insErr || !invoice) return { error: insErr?.message ?? "Could not create invoice" };

  const items = totals.lines.map((line, index) => ({
    invoice_id: invoice.id,
    product_id: parsed.data.lines[index].product_id ?? null,
    description: line.description,
    description_ar: parsed.data.lines[index].description_ar ?? null,
    quantity: line.quantity,
    unit_price: line.unit_price,
    line_subtotal: line.line_subtotal,
    line_vat: line.line_vat,
    line_total: line.line_total,
    position: index,
  }));

  const { error: itemErr } = await supabase.from("invoice_items").insert(items);
  if (itemErr) {
    await supabase.from("invoices").delete().eq("id", invoice.id);
    return { error: itemErr.message };
  }

  if (parsed.data.status !== "draft") {
    await decrementStock(parsed.data.lines);
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { ok: true, invoiceId: invoice.id };
}

export async function updateInvoiceAction(id: string, input: InvoiceInput) {
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid invoice" };
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("invoices")
    .select("id, status, organization_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { error: "Invoice not found." };
  if (existing.organization_id !== ctx.organization.id) return { error: "Forbidden." };
  if (existing.status !== "draft") {
    return { error: "Only draft invoices can be edited. Move the invoice back to draft first." };
  }

  const totals = computeInvoiceTotals(parsed.data.lines, parsed.data.vat_rate);

  const { error: updErr } = await supabase
    .from("invoices")
    .update({
      customer_id: parsed.data.customer_id ?? null,
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date ?? null,
      notes: parsed.data.notes ?? null,
      vat_rate: parsed.data.vat_rate,
      subtotal: totals.subtotal,
      vat_total: totals.vat_total,
      total: totals.total,
    })
    .eq("id", id);
  if (updErr) return { error: updErr.message };

  const { error: delErr } = await supabase.from("invoice_items").delete().eq("invoice_id", id);
  if (delErr) return { error: delErr.message };

  const items = totals.lines.map((line, index) => ({
    invoice_id: id,
    product_id: parsed.data.lines[index].product_id ?? null,
    description: line.description,
    description_ar: parsed.data.lines[index].description_ar ?? null,
    quantity: line.quantity,
    unit_price: line.unit_price,
    line_subtotal: line.line_subtotal,
    line_vat: line.line_vat,
    line_total: line.line_total,
    position: index,
  }));
  const { error: insErr } = await supabase.from("invoice_items").insert(items);
  if (insErr) return { error: insErr.message };

  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { ok: true, invoiceId: id };
}

export async function updateInvoiceStatusAction(id: string, status: "draft" | "sent" | "paid" | "void") {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteInvoiceAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { ok: true };
}

async function decrementStock(lines: z.infer<typeof lineSchema>[]) {
  const supabase = await createSupabaseServerClient();
  for (const line of lines) {
    if (!line.product_id) continue;
    const { data: product } = await supabase
      .from("products")
      .select("stock_qty")
      .eq("id", line.product_id)
      .maybeSingle();
    if (!product) continue;
    const next = Math.max(0, Number(product.stock_qty) - Number(line.quantity));
    await supabase.from("products").update({ stock_qty: next }).eq("id", line.product_id);
  }
}
