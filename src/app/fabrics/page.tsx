import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { QUALITY_LABELS } from "@/lib/format";
import { serverGet } from "@/lib/server-api";
import type { Fabric } from "@/types/api";

export const metadata: Metadata = { title: "Fabric guide", description: "Every fabric we stitch, with composition, weight, best uses and live Pakistani mill prices." };
export const revalidate = 600;

export default async function FabricsPage() {
  const fabrics = (await serverGet<Fabric[]>("/catalog/fabrics/")) ?? [];
  const groups = ["economy", "standard", "premium", "elite"].map((q) => ({ q, items: fabrics.filter((f) => f.quality === q) })).filter((g) => g.items.length);
  return (
    <div className="container-x py-10 lg:py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Fabric guide</p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Know exactly what you're paying for</h1>
        <p className="mt-3 text-muted-foreground">We buy knitted fabric by the kilogram from mills in Faisalabad, Karachi and Lahore. The rate you see here is what we pay (PKR/kg); your garment price is that rate × fabric used per piece, plus labour. Pick any fabric on a product page and the price updates instantly.</p>
      </div>
      <div className="mt-10 space-y-12">
        {groups.map((group) => (
          <section key={group.q} id={group.q}>
            <div className="mb-5 flex items-center gap-3"><h2 className="font-display text-2xl font-bold">{QUALITY_LABELS[group.q]}</h2><Badge variant="soft">{group.items.length} fabrics</Badge></div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((f) => (
                <article key={f.id} id={f.slug} className="scroll-mt-24 rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="size-10 rounded-full border border-border" style={{ background: f.swatch_color }} />
                      <div><h3 className="font-semibold leading-tight">{f.name}</h3><p className="text-xs text-muted-foreground">{f.composition}</p></div>
                    </div>
                    <div className="text-right"><p className="text-sm font-bold">PKR {Number(f.price_pkr).toLocaleString()}</p><p className="text-[11px] text-muted-foreground">per {f.price_unit}</p></div>
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg bg-muted p-2"><dt className="text-muted-foreground">Weight</dt><dd className="font-semibold">{f.gsm} GSM</dd></div>
                    <div className="rounded-lg bg-muted p-2"><dt className="text-muted-foreground">Width</dt><dd className="font-semibold">{f.width_inches}"</dd></div>
                    <div className="rounded-lg bg-muted p-2"><dt className="text-muted-foreground">Mills</dt><dd className="truncate font-semibold" title={f.typical_mills}>{f.typical_mills.split("/")[0].trim()}</dd></div>
                  </dl>
                  {f.features.length ? <ul className="mt-3 flex flex-wrap gap-1.5">{f.features.map((x) => <li key={x} className="rounded-full border border-border px-2 py-0.5 text-[11px]">{x}</li>)}</ul> : null}
                  {f.best_for.length ? <p className="mt-3 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Best for:</span> {f.best_for.join(", ")}</p> : null}
                  <Link href={`/products?fabric=${f.slug}`} className="mt-4 inline-block text-xs font-semibold text-brand-600 hover:underline">Products in this fabric →</Link>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
