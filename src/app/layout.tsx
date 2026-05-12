import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/theme-provider";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fawtara — Saudi VAT invoicing",
    template: "%s · Fawtara",
  },
  description: "Issue VAT-compliant invoices in Arabic and English, track inventory, and view revenue.",
  applicationName: "Fawtara",
};

export const viewport: Viewport = {
  themeColor: "hsl(158, 64%, 32%)",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return (
    <html lang={locale} dir={dict.direction} suppressHydrationWarning className={`${plexSans.variable} ${plexArabic.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextTopLoader
            color="hsl(158 64% 45%)"
            height={2}
            showSpinner={false}
            shadow="0 0 8px hsl(158 64% 45%)"
          />
          {children}
          <Toaster richColors closeButton position={dict.direction === "rtl" ? "bottom-left" : "bottom-right"} />
        </ThemeProvider>
      </body>
    </html>
  );
}
