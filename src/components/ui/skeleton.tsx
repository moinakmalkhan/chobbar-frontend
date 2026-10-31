import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-muted", className)} {...props} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <Skeleton className="mt-3 h-3 w-1/3" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-3 h-4 w-1/2" />
    </div>
  );
}
