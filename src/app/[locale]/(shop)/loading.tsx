import { ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // Instant feedback on navigation: a thin progress bar plus a light skeleton (no JS, no heavy paint).
  return (
    <>
      <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden">
        <div className="bg-brand-600 h-full w-1/3 animate-[loading-bar_1s_ease-in-out_infinite]" />
      </div>
      <div className="container-x py-8" aria-busy="true">
        <Skeleton className="mb-3 h-4 w-40" />
        <Skeleton className="mb-8 h-9 w-64" />
        <ProductGridSkeleton count={8} />
      </div>
    </>
  );
}
