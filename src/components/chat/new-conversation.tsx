"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useStartConversation } from "@/hooks/use-chat";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";

const TOPICS = ["sizing", "order", "returns", "other"] as const;
type Topic = (typeof TOPICS)[number];

export function NewConversation({
  orderId,
  orderNumber,
  onStarted,
}: {
  orderId?: string;
  orderNumber?: string;
  onStarted: (c: Conversation) => void;
}) {
  const { t } = useI18n();
  const [topic, setTopic] = useState<Topic>(orderId ? "order" : "sizing");
  const [body, setBody] = useState("");
  const start = useStartConversation();
  const label = (k: Topic) => t(`chat.topics.${k}`);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (body.trim().length < 2) return;
        start.mutate(
          {
            body: body.trim(),
            topic,
            order: orderId,
            subject: orderNumber ? `${label(topic)} · ${orderNumber}` : label(topic),
          },
          { onSuccess: onStarted },
        );
      }}
      className="space-y-4 p-4"
    >
      <div>
        <p className="mb-2 text-sm font-medium">{t("chat.topic")}</p>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTopic(k)}
              aria-pressed={topic === k}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                topic === k
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 font-semibold"
                  : "border-border hover:border-foreground/30",
              )}
            >
              {label(k)}
            </button>
          ))}
        </div>
      </div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("chat.placeholder")}
        aria-label={t("chat.placeholder")}
        rows={4}
        autoFocus
      />
      <Button type="submit" className="w-full" loading={start.isPending} disabled={body.trim().length < 2}>
        {t("chat.start")}
      </Button>
    </form>
  );
}
