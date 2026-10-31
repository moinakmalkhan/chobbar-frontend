import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Leepa Sports" };

export default function AboutPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">About</p>
      <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Made in Sialkot, worn everywhere</h1>
      <div className="prose mt-6 max-w-none text-muted-foreground [&_p]:leading-relaxed">
        <p>Leepa Sports is a family-run sportswear manufacturer based in Sialkot, Pakistan — the city that produces most of the world's hand-stitched footballs and a large share of its teamwear. We run our own cutting, stitching, sublimation and embroidery lines, so there is no middleman between your club and the factory floor.</p>
        <p>This platform is how we work with clubs, schools, team stores and brands: transparent pricing built from real mill fabric rates, an ordering flow designed for procurement teams, and production updates you don't have to chase.</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {["Own facility with 200+ machines", "Sublimation, screen print, embroidery, DTF", "OEKO-TEX® certified fabrics on request", "Exporting to 30+ countries since 2008"].map((t) => <li key={t} className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground">{t}</li>)}
        </ul>
      </div>
    </div>
  );
}
