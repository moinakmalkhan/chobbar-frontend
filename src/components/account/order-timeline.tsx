import { Check, Circle, Clock } from "lucide-react";

import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderHistory, OrderStatus } from "@/types/api";

const STEP_ORDER: OrderStatus[] = ["pending_payment", "confirmed", "in_production", "quality_check", "shipped", "delivered", "completed"];
const LABELS: Record<string, string> = { pending_approval: "Approval", pending_payment: "Payment", confirmed: "Confirmed", in_production: "Production", quality_check: "QC", shipped: "Shipped", delivered: "Delivered", completed: "Completed", cancelled: "Cancelled" };

export function OrderTimeline({ steps, history, status }: { steps?: { status: OrderStatus; label: string; reached: boolean }[]; history: OrderHistory[]; status: OrderStatus }) {
  const reached = new Set(history.map((h) => h.to_status));
  reached.add(status);
  const list = steps ?? STEP_ORDER.map((s) => ({ status: s, label: LABELS[s], reached: reached.has(s) }));
  const currentIndex = Math.max(list.findIndex((s) => s.status === status), list.map((s) => s.reached).lastIndexOf(true));
  const cancelled = status === "cancelled";

  return (
    <div>
      <ol className="relative grid gap-2 grid-cols-7 text-center text-[11px] sm:text-xs">
        {list.map((step, i) => {
          const done = step.reached || i < currentIndex;
          const current = i === currentIndex && !cancelled;
          return (
            <li key={step.status} className="relative flex flex-col items-center">
              {i > 0 ? <span className={cn("absolute right-1/2 top-3.5 -z-0 h-0.5 w-full", done ? "bg-brand-500" : "bg-border")} /> : null}
              <span className={cn("relative z-10 flex size-7 items-center justify-center rounded-full border-2", cancelled && i >= currentIndex ? "border-border bg-muted text-muted-foreground" : done || current ? "border-brand-500 bg-brand-500 text-white" : "border-border bg-background text-muted-foreground", current && "ring-4 ring-brand-500/20")}>
                {done && !current ? <Check className="size-3.5" strokeWidth={3} /> : current ? <Clock className="size-3.5" /> : <Circle className="size-2 fill-current" />}
              </span>
              <span className={cn("mt-1.5 leading-tight", current ? "font-semibold text-foreground" : done ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
            </li>
          );
        })}
      </ol>
      {cancelled ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">This order was cancelled.</p> : null}
      {history.length ? (
        <ol className="mt-6 space-y-3 border-l-2 border-border pl-4">
          {[...history].reverse().map((h, i) => (
            <li key={`${h.to_status}-${h.created_at}-${i}`} className="relative text-sm">
              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-background bg-brand-500" />
              <p className="font-medium">{LABELS[h.to_status] ?? h.to_status}{h.note ? <span className="font-normal text-muted-foreground"> — {h.note}</span> : null}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(h.created_at)}{h.changed_by ? ` · ${h.changed_by}` : ""}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
