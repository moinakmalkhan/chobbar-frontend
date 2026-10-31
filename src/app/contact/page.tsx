"use client";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/env";
import { useUIStore } from "@/stores/ui-store";

export default function ContactPage() {
  const setChatOpen = useUIStore((s) => s.setChatOpen);
  return (
    <div className="container-x py-12 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Contact</p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Talk to the people who make your kit</h1>
          <p className="mt-3 text-muted-foreground">Fastest way to reach us is the chat — it goes straight to the sales and production team and keeps everything attached to your account and orders.</p>
          <Button className="mt-6" onClick={() => setChatOpen(true)}><MessageCircle /> Open chat</Button>
        </div>
        <ul className="space-y-4">
          {[[Mail, "Email", SITE.supportEmail, `mailto:${SITE.supportEmail}`], [Phone, "Phone / WhatsApp", SITE.phone, `tel:${SITE.phone.replace(/\s/g, "")}`], [MapPin, "Factory", SITE.address, undefined]].map(([Icon, label, value, href]) => {
            const I = Icon as typeof Mail;
            return (
              <li key={label as string} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><I className="size-5" /></div>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label as string}</p>{href ? <a href={href as string} className="font-medium hover:text-brand-600">{value as string}</a> : <p className="font-medium">{value as string}</p>}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
