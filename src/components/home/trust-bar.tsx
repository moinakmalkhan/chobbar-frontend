import { BadgeDollarSign, Factory, Globe2, ShieldCheck } from "lucide-react";

const items = [
  { icon: Factory, title: "Manufacturer direct", text: "Cut, stitched and printed in our own Sialkot facility." },
  { icon: BadgeDollarSign, title: "Transparent pricing", text: "Labour + fabric at mill rates. Volume tiers from 50 pcs." },
  { icon: ShieldCheck, title: "Pay with confidence", text: "Bank transfer, 50% deposit or net terms for verified accounts." },
  { icon: Globe2, title: "Ships worldwide", text: "Sea, air or express courier, estimated at checkout." },
];

export function TrustBar() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="container-x grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><Icon className="size-5" /></div>
            <div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-muted-foreground">{text}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
