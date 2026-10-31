"use client";

import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatMoney, QUALITY_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FabricOption } from "@/types/api";

export function FabricPicker({ options, value, onChange, currency = "USD" }: { options: FabricOption[]; value: string; onChange: (slug: string) => void; currency?: string }) {
  const base = options.find((o) => o.is_default) ?? options[0];
  const baseCost = Number(base?.unit_fabric_cost ?? 0);
  return (
    <div role="radiogroup" aria-label="Fabric" className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const f = option.fabric;
        const selected = f.slug === value;
        const delta = Number(option.unit_fabric_cost ?? 0) - baseCost;
        return (
          <button
            key={f.slug}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(f.slug)}
            className={cn("relative flex items-start gap-3 rounded-2xl border p-3 text-left transition-all hover:border-brand-300", selected ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20 dark:bg-brand-500/10" : "border-border bg-card")}
          >
            <span className="mt-0.5 size-9 shrink-0 rounded-full border border-border" style={{ background: f.swatch_color }} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{f.name}</span>
                <Badge variant={f.quality === "elite" ? "success" : f.quality === "premium" ? "soft" : f.quality === "standard" ? "info" : "default"} className="px-1.5 py-0 text-[10px]">{QUALITY_LABELS[f.quality]}</Badge>
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{f.composition} · {f.gsm} GSM</span>
              <span className="mt-1.5 block text-xs">
                {Math.abs(delta) < 0.005 ? <span className="text-muted-foreground">Standard fabric</span> : <span className={cn("font-semibold", delta > 0 ? "text-foreground" : "text-emerald-600")}>{delta > 0 ? "+" : "−"}{formatMoney(Math.abs(delta), currency)}/pc</span>}
                <span className="text-muted-foreground"> · PKR {Number(f.price_pkr).toLocaleString()}/{f.price_unit} at mill</span>
              </span>
            </span>
            {selected ? <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-brand-500 text-white"><Check className="size-3" strokeWidth={3} /></span> : null}
          </button>
        );
      })}
    </div>
  );
}
