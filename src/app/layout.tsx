import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
// @ts-expect-error - تصفير إيرور استيراد ملفات الـ CSS الجانبية في TypeScript
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@/lib/utils";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "صالون البحراوي  | احجز دورك الآن",
  description: "احجز موعدك في صالون البحراوي   وتابع طابور الانتظار لحظة بلحظة",
  keywords: ["حلاقة", "صالون", "حجز", "دقيق", "طابور"],
  openGraph: {
    title: "صالون البحراوي",
    description: "احجز موعدك في صالون البحراوي وتابع طابور الانتظار",
    locale: "ar_EG",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0d0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body
        className={cn(
          cairo.variable,
          "font-sans antialiased min-h-screen flex flex-col bg-background text-foreground"
        )}
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
