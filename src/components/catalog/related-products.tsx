"use client";

import { ProductRail } from "@/components/catalog/product-rail";
import { SectionHeading } from "@/components/shared/section";
import { useRecommendations, useRelated } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/client";

export function RelatedProducts({ slug }: { slug: string }) {
  const { t } = useI18n();
  const related = useRelated(slug);
  const together = useRecommendations(slug);
  const relatedSlugs = new Set((related.data ?? []).map((p) => p.slug));
  const look = (together.data ?? []).filter((p) => p.slug !== slug && !relatedSlugs.has(p.slug));
  return (
    <>
      {look.length >= 2 ? (
        <section className="container-x pt-16 sm:pt-20">
          <SectionHeading title={t("product.completeLook")} />
          <ProductRail products={look} />
        </section>
      ) : null}
      {related.isLoading || related.data?.length ? (
        <section className="container-x pt-16 sm:pt-20">
          <SectionHeading title={t("product.youMayLike")} />
          <ProductRail products={related.data} loading={related.isLoading} />
        </section>
      ) : null}
    </>
  );
}
