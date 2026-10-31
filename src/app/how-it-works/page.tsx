import type { Metadata } from "next";
import Link from "next/link";

import { HowItWorks } from "@/components/home/how-it-works";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "How ordering works", description: "Configuring, pricing, quotes, payment terms, production and tracking at Leepa Sports." };

const faqs = [
  ["What is the minimum order?", "Most products start at 10 pieces; accessories like socks and caps start at 50. You can mix sizes and genders freely within one line."],
  ["How is the price calculated?", "Unit price = labour (cutting, stitching, printing, trims, margin) + fabric (mill PKR/kg × fabric used per piece, converted at the current rate). Volume tiers apply from 50 pieces, and verified companies may have a customer-group discount or contract prices."],
  ["Can I get a formal quote?", "Yes. Configure everything in the cart and click “Request a quote”. Sales replies within one business day with negotiated prices you can accept online — it converts straight into an order."],
  ["Which payment methods do you accept?", "Bank transfer (full or 50% deposit) for every account. Net 15/30/60 invoicing with a credit limit for verified companies. Card payments are coming soon."],
  ["How do approvals work?", "Company owners/admins can set a per-member spend limit or a company threshold. Orders above it wait for an admin's approval — approvers get an email and an in-app notification."],
  ["How long does production take?", "Typically 18–28 days after artwork approval, shown per product. Each stage (confirmed, in production, QC, shipped, delivered) appears on your order timeline with email updates."],
  ["Can I reorder?", "One click from any past order, or save a configuration as a named list (e.g. “Season 26/27 first team”) and add it to the cart whenever you need."],
];

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorks />
      <section className="container-x pb-16" id="payment">
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-10">
          <h2 className="font-display text-2xl font-bold">Frequently asked</h2>
          <dl className="mt-6 divide-y divide-border">
            {faqs.map(([q, a]) => (
              <div key={q} className="grid gap-2 py-5 md:grid-cols-[1fr_2fr]">
                <dt className="font-semibold">{q}</dt>
                <dd className="text-sm text-muted-foreground">{a}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild><Link href="/products">Start configuring</Link></Button>
            <Button variant="outline" asChild><Link href="/contact">Talk to sales</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
