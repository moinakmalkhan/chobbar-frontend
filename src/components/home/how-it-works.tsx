import { ClipboardCheck, PackageCheck, Palette, Scissors } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const steps = [
  { icon: Palette, title: "Configure", text: "Choose fabric quality, enter quantities per size and gender, upload artwork. Price updates instantly." },
  { icon: ClipboardCheck, title: "Order or request a quote", text: "Check out with PO number and payment terms, or send the cart to sales for a negotiated price." },
  { icon: Scissors, title: "We produce", text: "Artwork approval, cutting, stitching, printing and QC — each step appears on your order timeline." },
  { icon: PackageCheck, title: "Track & reorder", text: "Live tracking to your door. Reorder last season's kit in one click or from a saved list." },
];

export function HowItWorks() {
  return (
    <section className="container-x py-14 lg:py-20" id="how-it-works">
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">How it works</p>
          <h2 className="mt-1 font-display text-3xl font-bold">From spreadsheet to shipped kit, without the email ping-pong</h2>
          <p className="mt-3 text-sm text-muted-foreground">Everything a procurement team expects: company accounts with roles and approvals, contract pricing, net terms, invoices and a full audit trail.</p>
          <Button className="mt-6" variant="outline" asChild><Link href="/how-it-works">Read the full guide</Link></Button>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-2xl border border-border bg-card p-5">
              <span className="absolute right-4 top-4 font-display text-4xl font-extrabold text-muted/80">{i + 1}</span>
              <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><Icon className="size-5" /></div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
