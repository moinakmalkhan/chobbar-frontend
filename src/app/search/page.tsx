import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchResults } from "./search-results";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <div className="container-x py-8 lg:py-12">
      <Suspense>
        <SearchResults />
      </Suspense>
    </div>
  );
}
