// Render the print template with sample data to /tmp/sample-print.html
// so we can eyeball Arabic shaping in a browser without a running app.
import { writeFile } from "node:fs/promises";

const org = {
  name: "Acme Trading Co.",
  legal_name: "شركة أكمي للتجارة",
  vat_number: "300123456700003",
  cr_number: "1010123456",
  email: "sales@acme.example",
  phone: "+966 11 555 0000",
  address_line: "King Fahd Road",
  city: "Riyadh",
  country: "Saudi Arabia",
};

const customer = {
  name: "Al-Nahda Constructions",
  name_ar: "شركة النهضة للمقاولات",
  vat_number: "311987654300003",
  email: "ahmed@nahda.example",
  phone: "+966 55 100 2030",
  address_line: "Olaya Street",
  city: "Riyadh",
};

const items = [
  {
    description: "Concrete mixer, 350L capacity",
    description_ar: "خلاطة خرسانة سعة 350 لتر",
    quantity: 2,
    unit_price: 4500,
    line_vat: 1350,
    line_total: 10350,
  },
  {
    description: "Scaffolding rental — 30 days",
    description_ar: "إيجار سقالات لمدة 30 يومًا",
    quantity: 1,
    unit_price: 1800,
    line_vat: 270,
    line_total: 2070,
  },
];

const inv = {
  invoice_number: "INV-2026-00001",
  issue_date: "2026-05-12",
  due_date: "2026-05-26",
  status: "sent",
  currency: "SAR",
  notes: "Thanks for your business.\nشكرًا لتعاملكم معنا.",
  subtotal: 10800,
  vat_total: 1620,
  total: 12420,
  vat_rate: 15,
};

const fmt = (n) =>
  `${inv.currency} ${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const printStyles = `
  @page { size: A4; margin: 16mm 14mm; }
  body { margin: 0; padding: 24px; }
  .print-root {
    color: #181b21; background: #fff; font-size: 11px; line-height: 1.45;
    font-family: "IBM Plex Sans", -apple-system, "Helvetica Neue", "Arial", sans-serif;
    font-feature-settings: "ss01" 1, "cv11" 1;
  }
  .print-root * { box-sizing: border-box; }
  .print-root [dir="rtl"] {
    font-family: "IBM Plex Sans Arabic", "Noto Sans Arabic", "Tahoma", sans-serif;
    unicode-bidi: isolate;
    font-feature-settings: "kern" 1, "calt" 1;
  }
  .head { display: flex; justify-content: space-between; gap: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
  .brand .company { font-size: 18px; font-weight: 600; }
  .brand .company-ar { font-size: 13px; color: #5a6473; margin-top: 2px; text-align: left; }
  .brand .meta-stack { color: #5a6473; font-size: 10.5px; margin-top: 4px; }
  .title-block { text-align: right; min-width: 240px; }
  .title-en { font-size: 22px; font-weight: 700; color: #0f6b51; letter-spacing: 0.04em; }
  .title-ar { font-size: 14px; color: #5a6473; margin-top: 4px; }
  .meta-table { width: 100%; margin-top: 14px; border-collapse: collapse; }
  .meta-label { color: #5a6473; font-size: 10px; text-align: left; padding: 4px 0; direction: ltr; unicode-bidi: plaintext; }
  .meta-label .sep { margin: 0 4px; }
  .meta-value { text-align: right; font-weight: 600; font-size: 11px; padding: 4px 0; }
  .status { font-weight: 600; font-size: 10px; padding: 2px 8px; border-radius: 999px; background: #fef3c7; color: #92400e; }
  .bill-to { margin-top: 22px; }
  .section-label { color: #5a6473; font-size: 10px; letter-spacing: 0.06em; font-weight: 600; text-transform: uppercase; direction: ltr; unicode-bidi: plaintext; }
  .section-label .sep { margin: 0 6px; }
  .customer { margin-top: 6px; }
  .customer-name { font-size: 13px; font-weight: 600; }
  .customer-name-ar { font-size: 12px; color: #5a6473; text-align: left; }
  .customer-meta { color: #5a6473; font-size: 10.5px; margin-top: 2px; }
  .items { margin-top: 22px; }
  .items table { width: 100%; border-collapse: collapse; }
  .items th { text-align: left; color: #5a6473; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; background: #f5f7f9; padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
  .items th.num { text-align: right; }
  .items td { padding: 10px; vertical-align: top; border-bottom: 1px solid #f0f2f5; font-size: 11px; }
  .items td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .items td.strong { font-weight: 600; }
  .items .th-ar { color: #98a1ad; font-size: 9px; margin-top: 1px; font-weight: 500; }
  .items .col-desc { width: 50%; }
  .items .cell-ar { color: #5a6473; font-size: 10.5px; margin-top: 2px; text-align: left; }
  .totals-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; gap: 20px; }
  .totals { min-width: 280px; border-collapse: collapse; }
  .totals td { padding: 5px 0; font-size: 11px; }
  .totals .sum-label { text-align: left; color: #5a6473; direction: ltr; unicode-bidi: plaintext; padding-right: 24px; }
  .totals .sum-label .sep { margin: 0 5px; }
  .totals .sum-value { text-align: right; font-variant-numeric: tabular-nums; }
  .totals tr.strong { font-weight: 600; }
  .totals tr.strong .sum-label { color: #181b21; font-size: 12px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
  .totals tr.strong .sum-value { color: #181b21; font-size: 14px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
  .notes { margin-top: 30px; max-width: 60%; }
  .notes-body { margin-top: 4px; color: #181b21; font-size: 10.5px; white-space: pre-wrap; unicode-bidi: plaintext; text-align: left; }
  .foot { margin-top: 60px; color: #98a1ad; font-size: 9px; text-align: right; direction: ltr; }
`;

const html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <title>Invoice ${inv.invoice_number}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${printStyles}</style>
</head>
<body>
  <div class="print-root">
    <header class="head">
      <div class="brand">
        <div class="company">${org.name}</div>
        <div class="company-ar" dir="rtl">${org.legal_name}</div>
        <div class="meta-stack">${[org.address_line, org.city, org.country].filter(Boolean).join(" · ")}</div>
        <div class="meta-stack">${[org.phone, org.email].filter(Boolean).join(" · ")}</div>
        <div class="meta-stack">VAT No. ${org.vat_number}</div>
        <div class="meta-stack">CR No. ${org.cr_number}</div>
      </div>
      <div class="title-block">
        <div class="title-en">TAX INVOICE</div>
        <div class="title-ar" dir="rtl">فاتورة ضريبية</div>
        <table class="meta-table">
          <tbody>
            <tr><td class="meta-label"><span>Invoice No.</span><span class="sep"> · </span><span dir="rtl">رقم الفاتورة</span></td><td class="meta-value">${inv.invoice_number}</td></tr>
            <tr><td class="meta-label"><span>Issue date</span><span class="sep"> · </span><span dir="rtl">تاريخ الإصدار</span></td><td class="meta-value">${inv.issue_date}</td></tr>
            <tr><td class="meta-label"><span>Due date</span><span class="sep"> · </span><span dir="rtl">تاريخ الاستحقاق</span></td><td class="meta-value">${inv.due_date}</td></tr>
            <tr><td class="meta-label"><span>Status</span><span class="sep"> · </span><span dir="rtl">الحالة</span></td><td class="meta-value"><span class="status">${inv.status.toUpperCase()}</span></td></tr>
          </tbody>
        </table>
      </div>
    </header>

    <section class="bill-to">
      <div class="section-label"><span>BILL TO</span><span class="sep"> · </span><span dir="rtl">العميل</span></div>
      <div class="customer">
        <div class="customer-name">${customer.name}</div>
        <div class="customer-name-ar" dir="rtl">${customer.name_ar}</div>
        <div class="customer-meta">
          <div>VAT No. ${customer.vat_number}</div>
          <div>${customer.address_line}</div>
          <div>${customer.city}</div>
          <div>${customer.phone}</div>
          <div>${customer.email}</div>
        </div>
      </div>
    </section>

    <section class="items">
      <table>
        <thead><tr>
          <th class="col-desc"><div>DESCRIPTION</div><div class="th-ar" dir="rtl">الوصف</div></th>
          <th class="num"><div>QTY</div><div class="th-ar" dir="rtl">الكمية</div></th>
          <th class="num"><div>UNIT PRICE</div><div class="th-ar" dir="rtl">السعر</div></th>
          <th class="num"><div>VAT</div><div class="th-ar" dir="rtl">الضريبة</div></th>
          <th class="num"><div>TOTAL</div><div class="th-ar" dir="rtl">الإجمالي</div></th>
        </tr></thead>
        <tbody>
          ${items
            .map(
              (it) => `<tr>
            <td><div>${it.description}</div><div class="cell-ar" dir="rtl">${it.description_ar}</div></td>
            <td class="num">${num(it.quantity)}</td>
            <td class="num">${num(it.unit_price)}</td>
            <td class="num">${num(it.line_vat)}</td>
            <td class="num strong">${num(it.line_total)}</td>
          </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </section>

    <section class="totals-row">
      <div></div>
      <table class="totals">
        <tbody>
          <tr><td class="sum-label"><span>Subtotal</span><span class="sep"> · </span><span dir="rtl">المجموع الفرعي</span></td><td class="sum-value">${fmt(inv.subtotal)}</td></tr>
          <tr><td class="sum-label"><span>VAT (${inv.vat_rate.toFixed(2)}%)</span><span class="sep"> · </span><span dir="rtl">ضريبة القيمة المضافة</span></td><td class="sum-value">${fmt(inv.vat_total)}</td></tr>
          <tr class="strong"><td class="sum-label"><span>TOTAL</span><span class="sep"> · </span><span dir="rtl">الإجمالي</span></td><td class="sum-value">${fmt(inv.total)}</td></tr>
        </tbody>
      </table>
    </section>

    <section class="notes">
      <div class="section-label"><span>Notes</span><span class="sep"> · </span><span dir="rtl">ملاحظات</span></div>
      ${inv.notes
        .split(/\n+/)
        .map((line) => `<div class="notes-body">${line}</div>`)
        .join("")}
    </section>

    <footer class="foot"><span>${inv.invoice_number}</span><span class="sep"> · </span><span>${org.name}</span></footer>
  </div>
</body>
</html>`;

await writeFile("/tmp/sample-print.html", html);
console.log("Wrote /tmp/sample-print.html");
