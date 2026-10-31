import "../globals.css";

import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Arabic, Poppins } from "next/font/google";
import { notFound } from "next/navigation";

import { Providers } from "@/components/layout/providers";
import { I18nProvider } from "@/i18n/client";
import { isLocale, LOCALE_META, LOCALES, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { env, SITE } from "@/lib/env";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Headings use the same geometric face as the wordmark.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});
// One clean Arabic-script face for Urdu and Arabic (covers ٹ ڈ ڑ ں ے); only downloaded on those pages.
const arabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d0c" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  const title = `${SITE.name} — ${dict.common.brandTagline}`;
  return {
    metadataBase: new URL(env.siteUrl),
    title: { default: title, template: `%s · ${SITE.name}` },
    description: dict.home.heroSubtitle,
    applicationName: SITE.name,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].htmlLang, `/${l}`])),
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title,
      description: dict.home.heroSubtitle,
      locale: LOCALE_META[locale].intl.replace("-u-nu-latn", "").replace("-", "_"),
      images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: dict.home.heroSubtitle,
      images: ["/brand/og.jpg"],
    },
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
    manifest: "/manifest.webmanifest",
    formatDetection: { telephone: false },
  };
}

/** Applies the saved theme before first paint (no flash). */
const themeScript = `try{var t=localStorage.getItem("chobbar.theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const meta = LOCALE_META[locale as Locale];
  const rtl = meta.dir === "rtl";
  return (
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} ${arabic.variable}`}
      style={
        {
          "--font-body": rtl ? "var(--font-arabic), var(--font-inter)" : "var(--font-inter)",
          "--font-head": rtl ? "var(--font-arabic)" : "var(--font-poppins)",
        } as React.CSSProperties
      }
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <I18nProvider locale={locale as Locale} dict={dict}>
          <Providers>{children}</Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
