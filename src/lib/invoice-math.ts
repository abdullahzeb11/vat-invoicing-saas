import { round2 } from "@/lib/utils";

export interface DraftLine {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface ComputedLine extends DraftLine {
  line_subtotal: number;
  line_vat: number;
  line_total: number;
}

export interface InvoiceTotals {
  subtotal: number;
  vat_total: number;
  total: number;
  lines: ComputedLine[];
}

export function computeInvoiceTotals(lines: DraftLine[], vatRatePct: number): InvoiceTotals {
  const rate = (Number(vatRatePct) || 0) / 100;
  let subtotal = 0;
  let vatTotal = 0;
  const computed: ComputedLine[] = lines.map((l) => {
    const qty = Number(l.quantity) || 0;
    const price = Number(l.unit_price) || 0;
    const line_subtotal = round2(qty * price);
    const line_vat = round2(line_subtotal * rate);
    const line_total = round2(line_subtotal + line_vat);
    subtotal += line_subtotal;
    vatTotal += line_vat;
    return { ...l, line_subtotal, line_vat, line_total };
  });
  subtotal = round2(subtotal);
  vatTotal = round2(vatTotal);
  return { subtotal, vat_total: vatTotal, total: round2(subtotal + vatTotal), lines: computed };
}
