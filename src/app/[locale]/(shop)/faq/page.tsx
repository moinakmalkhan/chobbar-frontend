import type { Metadata } from "next";

import { FaqList } from "@/components/content/faq-list";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { isLocale, type Locale } from "@/i18n/config";
import { getT } from "@/i18n/server";
import { serverGet } from "@/lib/server-api";
import type { FAQ } from "@/types/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getT(isLocale(locale) ? locale : "en");
  return { title: t("footer.faq") };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const [t, faqs] = await Promise.all([getT(locale), serverGet<FAQ[]>("/content/faq/", { locale })]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: (faqs ?? []).map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <div className="container-x max-w-3xl py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Breadcrumbs items={[{ label: t("nav.home"), href: "/" }, { label: t("footer.faq") }]} />
      <h1 className="font-display mb-2 text-3xl font-extrabold">{t("footer.faq")}</h1>
      <p className="text-muted-foreground mb-8">{t("faq.subtitle")}</p>
      <FaqList faqs={faqs ?? []} />
    </div>
  );
}
