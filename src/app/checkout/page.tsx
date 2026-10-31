import type { Metadata } from "next";

import { CheckoutPage } from "./checkout-page";

export const metadata: Metadata = { title: "Checkout" };

export default function Page() {
  return <CheckoutPage />;
}
