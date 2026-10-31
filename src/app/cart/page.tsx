import type { Metadata } from "next";
import { Suspense } from "react";

import { CartPage } from "./cart-page";

export const metadata: Metadata = { title: "Your order" };

export default function Page() {
  return (
    <Suspense>
      <CartPage />
    </Suspense>
  );
}
