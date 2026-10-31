"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/misc";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { Facets, Gender } from "@/types/api";

export interface FilterState {
  gender: string[];
  size: string[];
  color: string[];
  min_price?: string;
  max_price?: string;
  in_stock: boolean;
  on_sale: boolean;
}

export const EMPTY_FILTERS: FilterState = {
  gender: [],
  size: [],
  color: [],
  in_stock: false,
  on_sale: false,
};

export function countFilters(f: FilterState) {
  return (
    f.gender.length +
    f.size.length +
    f.color.length +
    (f.min_price ? 1 : 0) +
    (f.max_price ? 1 : 0) +
    (f.in_stock ? 1 : 0) +
    (f.on_sale ? 1 : 0)
  );
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function PriceRange({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [string?, string?];
  onChange: (v: [string?, string?]) => void;
}) {
  const { t } = useI18n();
  const [lo, setLo] = useState(value[0] ?? "");
  const [hi, setHi] = useState(value[1] ?? "");
  // Sync when filters are cleared from outside (chips / "clear all").
  const external = `${value[0] ?? ""}|${value[1] ?? ""}`;
  const [seen, setSeen] = useState(external);
  if (seen !== external) {
    setSeen(external);
    setLo(value[0] ?? "");
    setHi(value[1] ?? "");
  }
  const commit = useDebouncedCallback(
    (a: string, b: string) => onChange([a || undefined, b || undefined]),
    500,
  );
  const input =
    "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm tabular-nums outline-none focus:border-brand-500";
  return (
    <div className="flex items-center gap-2">
      <label className="flex-1">
        <span className="text-muted-foreground mb-1 block text-xs">{t("listing.min")}</span>
        <input
          inputMode="numeric"
          className={input}
          placeholder={String(Math.floor(min))}
          value={lo}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setLo(v);
            commit(v, hi);
          }}
        />
      </label>
      <span className="text-muted-foreground mt-5">–</span>
      <label className="flex-1">
        <span className="text-muted-foreground mb-1 block text-xs">{t("listing.max")}</span>
        <input
          inputMode="numeric"
          className={input}
          placeholder={String(Math.ceil(max))}
          value={hi}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setHi(v);
            commit(lo, v);
          }}
        />
      </label>
    </div>
  );
}

export function ProductFilters({
  facets,
  value,
  onChange,
  hideGender = false,
}: {
  facets?: Facets;
  value: FilterState;
  onChange: (next: FilterState) => void;
  hideGender?: boolean;
}) {
  const { t, number } = useI18n();
  const genders = facets?.genders ?? [];
  const sizes = facets?.sizes ?? [];
  const colors = facets?.colors ?? [];
  const open = ["availability", "size", "color", "price", ...(hideGender ? [] : ["gender"])];

  return (
    <Accordion type="multiple" defaultValue={open} className="w-full">
      <AccordionItem value="availability">
        <AccordionTrigger>{t("listing.availability")}</AccordionTrigger>
        <AccordionContent className="space-y-3">
          <label className="text-foreground flex cursor-pointer items-center justify-between gap-3 text-sm">
            {t("listing.inStockOnly")}
            <Switch checked={value.in_stock} onCheckedChange={(v) => onChange({ ...value, in_stock: v })} />
          </label>
          <label className="text-foreground flex cursor-pointer items-center justify-between gap-3 text-sm">
            {t("listing.onSaleOnly")}
            <Switch checked={value.on_sale} onCheckedChange={(v) => onChange({ ...value, on_sale: v })} />
          </label>
        </AccordionContent>
      </AccordionItem>

      {!hideGender && genders.length > 1 ? (
        <AccordionItem value="gender">
          <AccordionTrigger>{t("listing.gender")}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {genders.map((g) => {
                const on = value.gender.includes(g.value);
                return (
                  <button
                    key={g.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChange({ ...value, gender: toggle(value.gender, g.value) })}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                      on
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground hover:border-foreground/40",
                    )}
                  >
                    {t(`listing.genders.${g.value as Gender}`)}{" "}
                    <span className="opacity-60">{number(g.count)}</span>
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {sizes.length ? (
        <AccordionItem value="size">
          <AccordionTrigger>{t("listing.size")}</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((s) => {
                const on = value.size.includes(s.label);
                return (
                  <button
                    key={s.label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChange({ ...value, size: toggle(value.size, s.label) })}
                    className={cn(
                      "h-10 rounded-xl border text-xs font-semibold transition-colors",
                      on
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground hover:border-foreground/40",
                    )}
                    dir="ltr"
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {colors.length ? (
        <AccordionItem value="color">
          <AccordionTrigger>{t("listing.color")}</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {colors.map((c) => {
                const on = value.color.includes(c.slug);
                return (
                  <button
                    key={c.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChange({ ...value, color: toggle(value.color, c.slug) })}
                    className="text-foreground flex items-center gap-2.5 rounded-lg py-1 text-start text-sm"
                  >
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full ring-1 ring-black/10 transition-shadow dark:ring-white/20",
                        on && "ring-foreground ring-offset-background ring-2 ring-offset-2",
                      )}
                      style={{ backgroundColor: c.hex }}
                    >
                      {on ? (
                        <Check
                          className={cn("size-3.5", isLight(c.hex) ? "text-ink-900" : "text-white")}
                          strokeWidth={3}
                        />
                      ) : null}
                    </span>
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ) : null}

      {facets && facets.price.max > 0 ? (
        <AccordionItem value="price">
          <AccordionTrigger>{t("listing.price")}</AccordionTrigger>
          <AccordionContent>
            <PriceRange
              min={facets.price.min}
              max={facets.price.max}
              value={[value.min_price, value.max_price]}
              onChange={([a, b]) => onChange({ ...value, min_price: a, max_price: b })}
            />
          </AccordionContent>
        </AccordionItem>
      ) : null}
    </Accordion>
  );
}

export function isLight(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 170;
}
