"use client";

import { MessageCircle } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { useUIStore } from "@/stores/ui-store";
import type { FAQ } from "@/types/api";

export function FaqList({ faqs }: { faqs: FAQ[] }) {
  const { t } = useI18n();
  const openChat = useUIStore((s) => s.setChatOpen);
  const groups = faqs.reduce<Record<string, FAQ[]>>((acc, f) => {
    (acc[f.category || "General"] ??= []).push(f);
    return acc;
  }, {});
  return (
    <div className="space-y-10">
      {Object.entries(groups).map(([category, items]) => (
        <section key={category} data-reveal>
          <h2 className="text-brand-700 dark:text-brand-400 mb-2 text-xs font-bold tracking-[0.14em] uppercase">
            {category}
          </h2>
          <Accordion type="single" collapsible>
            {items.map((f) => (
              <AccordionItem key={f.id} value={String(f.id)}>
                <AccordionTrigger>{f.question}</AccordionTrigger>
                <AccordionContent className="whitespace-pre-line">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}
      <div className="bg-surface rounded-3xl p-6 text-center">
        <p className="font-semibold">{t("faq.stillNeedHelp")}</p>
        <Button className="mt-4" onClick={() => openChat(true)}>
          <MessageCircle />
          {t("chat.launcher")}
        </Button>
      </div>
    </div>
  );
}
