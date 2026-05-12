import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/org-context";
import { buildZatcaQrDataUrl } from "@/lib/zatca";
import { formatNumber } from "@/lib/utils";
import type { Invoice, InvoiceItem, Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

type InvoiceJoined = Invoice & {
  customer: Customer | null;
  items: InvoiceItem[];
};

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("invoices")
    .select("*, customer:customers(*), items:invoice_items(*)")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!data) notFound();

  const inv = data as unknown as InvoiceJoined;
  const items = [...(inv.items ?? [])].sort((a, b) => a.position - b.position);
  const org = ctx.organization;

  const qr = org.zatca_qr_enabled
    ? await buildZatcaQrDataUrl({
        sellerName: org.legal_name || org.name,
        vatNumber: org.vat_number ?? "",
        timestamp: new Date(inv.issue_date).toISOString(),
        total: inv.total,
        vat: inv.vat_total,
      })
    : null;

  const currency = inv.currency;
  const fmt = (n: number) => `${currency} ${formatNumber(n)}`;

  return (
    <div dir="ltr" className="print-root">
      <style>{printStyles}</style>
      <main className="sheet">
        <header className="head">
          <div className="brand">
            <div className="company">{org.name}</div>
            {org.legal_name ? <div className="company-ar" dir="rtl">{org.legal_name}</div> : null}
            <div className="meta-stack">
              {[org.address_line, org.city, org.country].filter(Boolean).join(" · ")}
            </div>
            <div className="meta-stack">
              {[org.phone, org.email].filter(Boolean).join(" · ")}
            </div>
            {org.vat_number ? <div className="meta-stack">VAT No. {org.vat_number}</div> : null}
            {org.cr_number ? <div className="meta-stack">CR No. {org.cr_number}</div> : null}
          </div>

          <div className="title-block">
            <div className="title-en">TAX INVOICE</div>
            <div className="title-ar" dir="rtl">فاتورة ضريبية</div>
            <table className="meta-table">
              <tbody>
                <MetaRow en="Invoice No." ar="رقم الفاتورة" value={inv.invoice_number} />
                <MetaRow en="Issue date" ar="تاريخ الإصدار" value={inv.issue_date} />
                {inv.due_date ? (
                  <MetaRow en="Due date" ar="تاريخ الاستحقاق" value={inv.due_date} />
                ) : null}
                <MetaRow
                  en="Status"
                  ar="الحالة"
                  value={<span className={`status status-${inv.status}`}>{inv.status.toUpperCase()}</span>}
                />
              </tbody>
            </table>
          </div>
        </header>

        <section className="bill-to">
          <div className="section-label">
            <span>BILL TO</span>
            <span className="sep"> · </span>
            <span dir="rtl" className="ar">العميل</span>
          </div>
          {inv.customer ? (
            <div className="customer">
              <div className="customer-name">{inv.customer.name}</div>
              {inv.customer.name_ar ? (
                <div className="customer-name-ar" dir="rtl">{inv.customer.name_ar}</div>
              ) : null}
              <div className="customer-meta">
                {inv.customer.vat_number ? <div>VAT No. {inv.customer.vat_number}</div> : null}
                {inv.customer.address_line ? <div>{inv.customer.address_line}</div> : null}
                {inv.customer.city ? <div>{inv.customer.city}</div> : null}
                {inv.customer.phone ? <div>{inv.customer.phone}</div> : null}
                {inv.customer.email ? <div>{inv.customer.email}</div> : null}
              </div>
            </div>
          ) : (
            <div className="customer-meta">Walk-in customer</div>
          )}
        </section>

        <section className="items">
          <table>
            <thead>
              <tr>
                <th className="col-desc">
                  <div>DESCRIPTION</div>
                  <div className="th-ar" dir="rtl">الوصف</div>
                </th>
                <th className="num">
                  <div>QTY</div>
                  <div className="th-ar" dir="rtl">الكمية</div>
                </th>
                <th className="num">
                  <div>UNIT PRICE</div>
                  <div className="th-ar" dir="rtl">السعر</div>
                </th>
                <th className="num">
                  <div>VAT</div>
                  <div className="th-ar" dir="rtl">الضريبة</div>
                </th>
                <th className="num">
                  <div>TOTAL</div>
                  <div className="th-ar" dir="rtl">الإجمالي</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <div>{it.description}</div>
                    {it.description_ar ? (
                      <div className="cell-ar" dir="rtl">{it.description_ar}</div>
                    ) : null}
                  </td>
                  <td className="num">{formatNumber(it.quantity)}</td>
                  <td className="num">{formatNumber(it.unit_price)}</td>
                  <td className="num">{formatNumber(it.line_vat)}</td>
                  <td className="num strong">{formatNumber(it.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="totals-row">
          <div className="qr-cell">
            {qr ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="ZATCA QR" width={120} height={120} />
                <div className="qr-caption">
                  <span>ZATCA-style QR</span>
                  <span className="sep"> · </span>
                  <span dir="rtl">رمز زاتكا</span>
                </div>
              </>
            ) : null}
          </div>
          <table className="totals">
            <tbody>
              <SumRow en="Subtotal" ar="المجموع الفرعي" value={fmt(inv.subtotal)} />
              <SumRow
                en={`VAT (${Number(inv.vat_rate).toFixed(2)}%)`}
                ar="ضريبة القيمة المضافة"
                value={fmt(inv.vat_total)}
              />
              <SumRow en="TOTAL" ar="الإجمالي" value={fmt(inv.total)} strong />
            </tbody>
          </table>
        </section>

        {inv.notes ? (
          <section className="notes">
            <div className="section-label">
              <span>Notes</span>
              <span className="sep"> · </span>
              <span dir="rtl" className="ar">ملاحظات</span>
            </div>
            {inv.notes.split(/\n+/).map((line, i) => (
              <div key={i} className="notes-body">
                {line}
              </div>
            ))}
          </section>
        ) : null}

        <footer className="foot">
          <span>{inv.invoice_number}</span>
          <span className="sep">·</span>
          <span>{org.name}</span>
        </footer>
      </main>
    </div>
  );
}

function MetaRow({ en, ar, value }: { en: string; ar: string; value: React.ReactNode }) {
  return (
    <tr>
      <td className="meta-label">
        <span>{en}</span>
        <span className="sep">·</span>
        <span dir="rtl">{ar}</span>
      </td>
      <td className="meta-value">{value}</td>
    </tr>
  );
}

function SumRow({ en, ar, value, strong }: { en: string; ar: string; value: string; strong?: boolean }) {
  return (
    <tr className={strong ? "strong" : ""}>
      <td className="sum-label">
        <span>{en}</span>
        <span className="sep">·</span>
        <span dir="rtl">{ar}</span>
      </td>
      <td className="sum-value">{value}</td>
    </tr>
  );
}

const printStyles = `
  @page { size: A4; margin: 16mm 14mm; }
  .print-root {
    color: #181b21;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    font-size: 11px;
    line-height: 1.45;
    font-family: var(--font-sans), -apple-system, "Helvetica Neue", Arial, sans-serif;
  }
  .print-root * { box-sizing: border-box; }
  .print-root [dir="rtl"] {
    font-family: var(--font-arabic), "IBM Plex Sans Arabic", "Noto Sans Arabic", "Tahoma", sans-serif;
    unicode-bidi: isolate;
    font-feature-settings: "kern" 1, "calt" 1;
  }

  .sheet { max-width: 100%; padding: 0; }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
  }
  .brand .company { font-size: 18px; font-weight: 600; letter-spacing: -0.01em; }
  .brand .company-ar { font-size: 13px; color: #5a6473; margin-top: 2px; text-align: left; }
  .brand .meta-stack { color: #5a6473; font-size: 10.5px; margin-top: 4px; }

  .title-block { text-align: right; min-width: 240px; }
  .title-en { font-size: 22px; font-weight: 700; color: #0f6b51; letter-spacing: 0.04em; }
  .title-ar { font-size: 14px; color: #5a6473; margin-top: 4px; }
  .meta-table { width: 100%; margin-top: 14px; border-collapse: collapse; }
  .meta-label {
    color: #5a6473;
    font-size: 10px;
    text-align: left;
    padding: 4px 0;
    direction: ltr;
    unicode-bidi: plaintext;
  }
  .meta-label .sep { margin: 0 4px; }
  .meta-value { text-align: right; font-weight: 600; font-size: 11px; padding: 4px 0; }

  .status { font-weight: 600; font-size: 10px; padding: 2px 8px; border-radius: 999px; }
  .status-draft { background: #f1f3f5; color: #5a6473; }
  .status-sent { background: #fef3c7; color: #92400e; }
  .status-paid { background: #d1fae5; color: #065f46; }
  .status-void { background: #fee2e2; color: #991b1b; }

  .bill-to { margin-top: 22px; }
  .section-label {
    color: #5a6473;
    font-size: 10px;
    letter-spacing: 0.06em;
    font-weight: 600;
    text-transform: uppercase;
    direction: ltr;
    unicode-bidi: plaintext;
  }
  .section-label .sep { margin: 0 6px; }
  .section-label .ar { letter-spacing: 0; }
  .customer { margin-top: 6px; }
  .customer-name { font-size: 13px; font-weight: 600; }
  .customer-name-ar { font-size: 12px; color: #5a6473; text-align: left; }
  .customer-meta { color: #5a6473; font-size: 10.5px; margin-top: 2px; }

  .items { margin-top: 22px; }
  .items table { width: 100%; border-collapse: collapse; }
  .items th {
    text-align: left;
    color: #5a6473;
    font-weight: 600;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: #f5f7f9;
    padding: 8px 10px;
    border-bottom: 1px solid #e5e7eb;
  }
  .items th.num { text-align: right; }
  .items td { padding: 10px; vertical-align: top; border-bottom: 1px solid #f0f2f5; font-size: 11px; }
  .items td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .items td.strong { font-weight: 600; }
  .items .th-ar { color: #98a1ad; font-size: 9px; margin-top: 1px; font-weight: 500; }
  .items .col-desc { width: 50%; }
  .items .cell-ar { color: #5a6473; font-size: 10.5px; margin-top: 2px; text-align: left; }

  .totals-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; gap: 20px; }
  .qr-cell { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
  .qr-cell img { display: block; }
  .qr-caption { color: #5a6473; font-size: 9px; direction: ltr; }
  .qr-caption .sep { margin: 0 4px; }

  .totals { min-width: 280px; border-collapse: collapse; }
  .totals td { padding: 5px 0; font-size: 11px; }
  .totals .sum-label {
    text-align: left;
    color: #5a6473;
    direction: ltr;
    unicode-bidi: plaintext;
    padding-right: 24px;
  }
  .totals .sum-label .sep { margin: 0 5px; }
  .totals .sum-value { text-align: right; font-variant-numeric: tabular-nums; }
  .totals tr.strong { font-weight: 600; }
  .totals tr.strong .sum-label { color: #181b21; font-size: 12px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
  .totals tr.strong .sum-value { color: #181b21; font-size: 14px; padding-top: 10px; border-top: 1px solid #e5e7eb; }

  .notes { margin-top: 30px; max-width: 60%; }
  .notes-body { margin-top: 4px; color: #181b21; font-size: 10.5px; white-space: pre-wrap; unicode-bidi: plaintext; text-align: left; }

  .foot {
    margin-top: 60px;
    color: #98a1ad;
    font-size: 9px;
    text-align: right;
    direction: ltr;
  }
  .foot .sep { margin: 0 6px; }
`;
