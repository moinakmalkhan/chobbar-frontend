import type { Metadata } from "next";
import { Suspense } from "react";

import { TrackOrder } from "./track-order";

export const metadata: Metadata = { title: "Track an order", description: "Track production and shipping of your Leepa Sports order with your order number and email." };

export default function Page() {
  return (
    <Suspense>
      <TrackOrder />
    </Suspense>
  );
}
