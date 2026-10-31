import type { Metadata } from "next";

import { QuickOrder } from "./quick-order";

export const metadata: Metadata = { title: "Quick order by SKU", description: "Paste SKUs, sizes and quantities straight from your spreadsheet." };

export default function Page() {
  return <QuickOrder />;
}
