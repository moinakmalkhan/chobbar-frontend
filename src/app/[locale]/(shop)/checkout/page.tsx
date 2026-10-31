import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { isLocale } from "@/i18n/config";
import { getT } from "@/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getT(isLocale(locale) ? locale : "en");
  return { title: t("checkout.title"), robots: { index: false } };
}

export default function CheckoutPage() {
  return <CheckoutForm />;
}
