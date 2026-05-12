import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { launchBrowser } from "@/lib/pdf-browser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: invoiceRow } = await supabase
    .from("invoices")
    .select("invoice_number, organization_id")
    .eq("id", id)
    .maybeSingle();
  if (!invoiceRow) return new NextResponse("Not found", { status: 404 });

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("organization_id", invoiceRow.organization_id)
    .maybeSingle();
  if (!membership) return new NextResponse("Forbidden", { status: 403 });

  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const printUrl = `${origin}/invoices/${id}/print`;
  const cookieHeader = request.headers.get("cookie") ?? "";

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();

    if (cookieHeader) {
      const { hostname } = new URL(origin);
      const cookies = parseCookieHeader(cookieHeader).map((c) => ({
        name: c.name,
        value: c.value,
        domain: hostname,
        path: "/",
        httpOnly: false,
        secure: origin.startsWith("https"),
        sameSite: "Lax" as const,
      }));
      if (cookies.length) await page.setCookie(...cookies);
    }

    await page.goto(printUrl, { waitUntil: "networkidle0", timeout: 25_000 });
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoiceRow.invoice_number}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } finally {
    await browser.close();
  }
}

function parseCookieHeader(header: string): { name: string; value: string }[] {
  return header
    .split(";")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const idx = pair.indexOf("=");
      if (idx === -1) return { name: pair, value: "" };
      return { name: pair.slice(0, idx), value: pair.slice(idx + 1) };
    });
}
