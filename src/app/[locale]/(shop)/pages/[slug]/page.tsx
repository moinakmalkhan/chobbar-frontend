import { marked } from "marked";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { isLocale, LOCALE_META, type Locale } from "@/i18n/config";
import { getT } from "@/i18n/server";
import { serverGet } from "@/lib/server-api";
import type { Page } from "@/types/api";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await serverGet<Page>(`/content/pages/${slug}/`, {
    locale: isLocale(locale) ? locale : "en",
    revalidate: 600,
  });
  if (!page) return {};
  return {
    title: page.title,
    description: page.meta_description || undefined,
    alternates: { canonical: `/${locale}/pages/${slug}` },
  };
}

/** Escape raw HTML in staff-written markdown before rendering (pages are admin content, but stay safe). */
function render(md: string) {
  const escaped = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return marked.parse(escaped, { async: false, gfm: true, breaks: false }) as string;
}

export default async function ContentPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const [t, page] = await Promise.all([
    getT(locale),
    serverGet<Page>(`/content/pages/${slug}/`, { locale, revalidate: 600 }),
  ]);
  if (!page) notFound();
  return (
    <article className="container-x max-w-3xl py-10">
      <Breadcrumbs items={[{ label: t("nav.home"), href: "/" }, { label: page.title }]} />
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{page.title}</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {t("pages.updated", {
          date: new Intl.DateTimeFormat(LOCALE_META[locale].intl, { dateStyle: "long" }).format(
            new Date(page.updated_at),
          ),
        })}
      </p>
      <div className="prose-chobbar mt-8" dangerouslySetInnerHTML={{ __html: render(page.body) }} />
    </article>
  );
}
