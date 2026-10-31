import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { Providers } from "@/components/layout/providers";
import { SiteShell } from "@/components/layout/site-shell";
import { env, SITE } from "@/lib/env";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: `${SITE.name} — Wholesale Teamwear & Custom Sportswear`, template: `%s | ${SITE.name}` },
  description:
    "Custom teamwear manufactured in Sialkot. Configure fabrics, sizes and branding, get instant wholesale pricing, request quotes and track every order.",
  keywords: ["wholesale sportswear", "custom teamwear", "sublimation jerseys", "Sialkot manufacturer", "B2B sportswear"],
  openGraph: { type: "website", siteName: SITE.name, title: `${SITE.name} — Wholesale Teamwear`, description: "Custom teamwear with live wholesale pricing.", images: ["/images/og.png"] },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          // Apply the saved theme before paint to avoid a flash.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('leepa.theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
