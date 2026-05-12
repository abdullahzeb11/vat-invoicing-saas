# Fawtara — Saudi VAT invoicing SaaS

A multi-tenant invoicing and inventory app aimed at Saudi small businesses. Issue VAT-compliant invoices, manage products and customers, and view monthly revenue.

Built with Next.js 15 (App Router), TypeScript, Tailwind, shadcn-style UI primitives, Supabase (Auth + Postgres + RLS), and headless Chrome for PDF rendering.

## Try the live demo

A pre-seeded demo account lets you skip signup and explore the app immediately.

- **URL**: https://fawtara-invoicing.netlify.app
- **Email**: `demo@fawtara.app`
- **Password**: `DemoPass123!`

The demo account already has a company set up, a few customers, products, and invoices — open the dashboard and click around. Please don't delete the seed data so the next visitor sees the same starting state. You can also sign up with your own email if you'd rather start from scratch (you'll get a confirmation email to verify).

## Features

- Email + password auth (Supabase)
- Multi-tenant data model with org-level RLS isolation
- Org onboarding on first sign-in
- Products and customers CRUD
- Invoice builder with line items, auto-numbering, and live VAT totals
- Configurable default VAT rate (15% out of the box)
- Bilingual PDF export (Arabic + English, rendered via the browser's native print engine) with optional ZATCA-style QR code
- Monthly revenue chart, outstanding/paid summary, and recent activity
- English and Arabic UI with RTL support
- Light and dark themes

## Tech stack

- Next.js 15 (App Router, Server Actions, Route Handlers)
- TypeScript, strict mode
- Tailwind CSS + custom shadcn-style primitives (`src/components/ui`)
- Supabase Auth (SSR cookies) and Supabase Postgres (RLS)
- Browser-native print rendering (`window.print()`) on a dedicated `/invoices/[id]/print` page for PDF export — Chrome/Safari/Firefox handle Arabic shaping, RTL, and ligatures natively. `qrcode` generates the ZATCA-style QR.
- `recharts` for the dashboard chart
- `next-themes` for theming

## Project layout

```
src/
  app/
    (auth)/login|signup       Auth pages
    (app)/dashboard           Authenticated app surface
    (app)/invoices            Invoice list, new, detail
    (app)/products            Product CRUD
    (app)/customers           Customer CRUD
    (app)/settings            Org settings (VAT, branding, ZATCA)
    actions/                  Server actions
    (print)/invoices/[id]/print  Standalone print page (browser → PDF)
    auth/callback             Supabase OAuth/email callback
    onboarding                First-time org setup
  components/                 UI primitives and app shell
  lib/
    supabase/                 Server + browser clients, middleware helper
    i18n/                     en/ar dictionaries
    zatca.ts                  ZATCA TLV + QR helper
    invoice-math.ts           VAT calculation
    org-context.ts            Authn + org membership helper
    types.ts                  Domain types
supabase/
  schema.sql                  Tables, RLS, and `next_invoice_number` RPC
```

## Setup

1. **Clone and install:**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at https://supabase.com. From the project dashboard, copy:

   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only)

3. **Apply the schema.** Open the SQL editor in Supabase and paste the contents of `supabase/schema.sql`, then run.

4. **Configure environment.** Copy `.env.example` to `.env.local` and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

5. **Email auth.** In Supabase Auth → URL Configuration, set the Site URL to your local dev URL (`http://localhost:3000`) and add it to the Redirect URLs list. For production, add your deployed URL too.

6. **Run locally:**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Deploying to Netlify

The repo ships with a `netlify.toml` that uses the official Next.js plugin.

1. Push the repo to GitHub.
2. In Netlify, **Add new site → Import from Git** and pick the repo.
3. Build command: `npm run build` (already set).
4. Add the environment variables from `.env.example` to **Site settings → Environment variables**.
5. Deploy. After it builds, update Supabase Auth URL Configuration with the deployed URL.

## PDF rendering

The invoice "PDF" is just the browser's native print engine acting on a dedicated `/invoices/[id]/print` page. When the user clicks **Download PDF** on the invoice detail page, a new tab opens the print URL with `?print=1`, a small client component triggers `window.print()`, and the browser shows its **Save as PDF** dialog. Chrome, Safari, and Firefox all handle Arabic shaping, ligatures, mark positioning (the ً in `يومًا`), and bidi natively, so the result matches what a Saudi user would expect from any modern browser.

This approach has nice properties for a portfolio project:

- **Zero serverless cost / no cold starts.** The Netlify Function path no longer launches Chromium.
- **Identical quality across operating systems** — Chrome on the user's machine is doing the rendering either way.
- **The print page is also a normal preview.** Visit `/invoices/[id]/print` (without `?print=1`) and you'll see the same layout in the browser, no dialog.

The fallback "Save as PDF" button in the bottom-right of the print page is hidden when the page is actually being printed (via the `print:hidden` Tailwind utility), so it doesn't appear in the final PDF.

To preview the print template offline (no Supabase needed):

```bash
node scripts/preview-print.mjs
open /tmp/sample-print.html
```

## Notes on Saudi VAT and ZATCA

- The default VAT rate is **15%**, matching the standard Saudi rate. Each org can override this in **Settings → Tax**.
- Invoice numbers are allocated atomically per org via the `next_invoice_number` Postgres function, with a configurable prefix (default `INV`).
- The **ZATCA-style QR** on the print page encodes the five Phase 1 TLV fields (seller name, VAT number, timestamp, total, VAT) and is base64-encoded as required. It is not a fully compliant Phase 2 QR — it does not include a signed CSID or cryptographic stamp. Treat it as a future-ready placeholder.

## Roadmap ideas

- Full ZATCA Phase 2 compliance (CSID, XML signing, archive)
- Multi-user orgs with proper invitations and role checks beyond the schema
- Recurring invoices, partial payments, credit notes
- Stripe / Mada / SADAD payment collection

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run typecheck` — TypeScript only
- `npm run lint` — ESLint
