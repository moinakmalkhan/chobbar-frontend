import type { Metadata } from "next";
import { Suspense } from "react";

import { TrackOrder } from "@/components/orders/track-order";
import { isLocale } from "@/i18n/config";
import { getT } from "@/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getT(isLocale(locale) ? locale : "en");
  return { title: t("track.title") };
}

export default function TrackPage() {
  return (
    <div className="container-x py-10 sm:py-16">
      <Suspense>
        <TrackOrder />
      </Suspense>
    </div>
  );
}
