import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { QUALITY_LABELS } from "@/lib/format";
import type { Fabric } from "@/types/api";

export function FabricStrip({ fabrics }: { fabrics: Fabric[] }) {
  if (!fabrics.length) return null;
  return (
    <section className="bg-ink-900 py-14 text-white lg:py-20">
      <div className="container-x">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Fabric transparency</p>
            <h2 className="mt-1 font-display text-3xl font-bold">Real mill fabrics, real mill prices</h2>
            <p className="mt-2 max-w-xl text-sm text-ink-300">Every product price is labour + fabric. Move up or down the quality ladder and watch the number change — rates follow what Faisalabad, Karachi and Lahore mills actually charge per kg.</p>
          </div>
          <Link href="/fabrics" className="text-sm font-semibold text-brand-400 hover:underline">Full fabric guide →</Link>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-5">
          {fabrics.slice(0, 10).map((f) => (
            <Link key={f.id} href={`/fabrics#${f.slug}`} className="group min-w-[200px] rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-brand-400/60 hover:bg-white/10">
              <div className="flex items-center justify-between">
                <span className="size-8 rounded-full border border-white/20" style={{ background: f.swatch_color }} />
                <Badge variant="outline" className="border-white/20 text-ink-200">{QUALITY_LABELS[f.quality]}</Badge>
              </div>
              <h3 className="mt-3 font-semibold">{f.name}</h3>
              <p className="text-xs text-ink-300">{f.composition} · {f.gsm} GSM</p>
              <p className="mt-2 text-xs text-ink-400">PKR {Number(f.price_pkr).toLocaleString()}/{f.price_unit}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
