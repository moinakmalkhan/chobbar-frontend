import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { CategoryIcon } from "@/components/layout/nav";
import type { CategoryNode } from "@/types/api";

export function CategoryShowcase({ categories }: { categories: CategoryNode[] }) {
  if (!categories.length) return null;
  return (
    <section className="container-x py-14 lg:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Shop by category</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Everything your club wears</h2>
        </div>
        <Link href="/products" className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:underline sm:flex">All products <ArrowUpRight className="size-4" /></Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`} className={`group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-2xl border border-border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${i === 0 ? "bg-ink-900 text-white lg:row-span-2" : "bg-card"}`}>
            <div className="flex items-center justify-between">
              <span className={`flex size-11 items-center justify-center rounded-xl ${i === 0 ? "bg-white/10 text-brand-400" : "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"}`}><CategoryIcon name={cat.icon} className="size-5" /></span>
              <span className={`text-xs ${i === 0 ? "text-ink-300" : "text-muted-foreground"}`}>{cat.product_count} products</span>
            </div>
            <div className="mt-6">
              <h3 className="font-display text-xl font-bold">{cat.name}</h3>
              <p className={`mt-1 line-clamp-2 text-sm ${i === 0 ? "text-ink-300" : "text-muted-foreground"}`}>{cat.children.map((c) => c.name).slice(0, 4).join(" · ") || cat.description}</p>
            </div>
            <ArrowUpRight className={`absolute right-5 top-5 size-5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 ${i === 0 ? "text-brand-400" : "text-brand-600"}`} />
          </Link>
        ))}
      </div>
    </section>
  );
}
