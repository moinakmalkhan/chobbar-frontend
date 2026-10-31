"use client";

import { Info } from "lucide-react";
import { useMemo } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/misc";
import { GENDER_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BreakdownLine, Gender, ProductDetail } from "@/types/api";

export type Matrix = Record<string, number>; // key = `${gender}:${size_id}`

export function matrixToBreakdown(matrix: Matrix): BreakdownLine[] {
  return Object.entries(matrix)
    .filter(([, qty]) => qty > 0)
    .map(([key, quantity]) => {
      const [gender, size_id] = key.split(":");
      return { gender: gender as Gender, size_id: Number(size_id), quantity };
    });
}

export function breakdownToMatrix(lines: BreakdownLine[]): Matrix {
  return Object.fromEntries(lines.map((l) => [`${l.gender}:${l.size_id}`, l.quantity]));
}

/**
 * Size × gender quantity grid. Each gender row only shows the sizes the product
 * offers for that gender (e.g. youth sizes for "youth"). Arrow keys move
 * between cells, so a buyer can type a whole order like a spreadsheet.
 */
export function SizeMatrix({ product, value, onChange, disabled }: { product: ProductDetail; value: Matrix; onChange: (next: Matrix) => void; disabled?: boolean }) {
  const byGender = useMemo(() => {
    const map = new Map<Gender, ProductDetail["size_options"]>();
    for (const option of product.size_options) {
      const list = map.get(option.gender) ?? [];
      list.push(option);
      map.set(option.gender, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.size.sort_order - b.size.sort_order);
    return map;
  }, [product.size_options]);

  const allSizes = useMemo(() => {
    const seen = new Map<number, ProductDetail["size_options"][number]["size"]>();
    for (const o of product.size_options) seen.set(o.size.id, o.size);
    return [...seen.values()].sort((a, b) => a.sort_order - b.sort_order);
  }, [product.size_options]);

  const setCell = (gender: Gender, sizeId: number, raw: string) => {
    const qty = Math.max(0, Math.min(99999, Number.parseInt(raw || "0", 10) || 0));
    const key = `${gender}:${sizeId}`;
    const next = { ...value };
    if (qty) next[key] = qty;
    else delete next[key];
    onChange(next);
  };

  const rowTotal = (gender: Gender) => Object.entries(value).filter(([k]) => k.startsWith(`${gender}:`)).reduce((n, [, q]) => n + q, 0);
  const colTotal = (sizeId: number) => Object.entries(value).filter(([k]) => k.endsWith(`:${sizeId}`)).reduce((n, [, q]) => n + q, 0);
  const total = Object.values(value).reduce((n, q) => n + q, 0);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const inputs = Array.from((e.currentTarget.closest("table") as HTMLTableElement).querySelectorAll<HTMLInputElement>("input:not([disabled])"));
    const i = inputs.indexOf(e.currentTarget);
    const cols = allSizes.length;
    const jump = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, Enter: cols }[e.key];
    if (jump === undefined) return;
    const target = inputs[i + jump];
    if (target) {
      e.preventDefault();
      target.focus();
      target.select();
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <th className="sticky left-0 bg-muted/60 px-3 py-2.5 text-left font-semibold backdrop-blur">Gender</th>
            {allSizes.map((size) => (
              <th key={size.id} className="px-1 py-2.5 text-center font-semibold">
                <span className="inline-flex items-center gap-0.5">
                  {size.label}
                  {Number(size.surcharge_percent) > 0 ? (
                    <Tooltip><TooltipTrigger asChild><Info className="size-3 text-amber-500" /></TooltipTrigger><TooltipContent>+{size.surcharge_percent}% for extra fabric{size.chest_cm ? ` · chest ${size.chest_cm} cm` : ""}</TooltipContent></Tooltip>
                  ) : size.chest_cm ? (
                    <Tooltip><TooltipTrigger asChild><Info className="size-3 text-muted-foreground/60" /></TooltipTrigger><TooltipContent>Chest {size.chest_cm} cm</TooltipContent></Tooltip>
                  ) : null}
                </span>
              </th>
            ))}
            <th className="px-3 py-2.5 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {product.genders.map((gender) => {
            const offered = new Set((byGender.get(gender) ?? []).map((o) => o.size.id));
            return (
              <tr key={gender} className="border-t border-border">
                <th scope="row" className="sticky left-0 bg-background px-3 py-2 text-left font-semibold">{GENDER_LABELS[gender]}</th>
                {allSizes.map((size) => {
                  const key = `${gender}:${size.id}`;
                  const available = offered.has(size.id);
                  const qty = value[key] ?? 0;
                  return (
                    <td key={size.id} className="p-1">
                      {available ? (
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={qty || ""}
                          placeholder="0"
                          disabled={disabled}
                          onChange={(e) => setCell(gender, size.id, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={onKeyDown}
                          aria-label={`${GENDER_LABELS[gender]} ${size.label} quantity`}
                          className={cn("h-10 w-full min-w-11 rounded-lg border bg-background text-center tabular-nums outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30", qty ? "border-brand-300 bg-brand-50/60 font-semibold dark:bg-brand-500/10" : "border-border")}
                        />
                      ) : (
                        <div className="flex h-10 items-center justify-center text-muted-foreground/40" aria-hidden>—</div>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-right font-semibold tabular-nums">{rowTotal(gender) || <span className="text-muted-foreground/60">0</span>}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-muted/40 text-xs">
            <th className="sticky left-0 bg-muted/40 px-3 py-2 text-left font-medium text-muted-foreground">Per size</th>
            {allSizes.map((size) => <td key={size.id} className="px-1 py-2 text-center tabular-nums text-muted-foreground">{colTotal(size.id) || ""}</td>)}
            <td className="px-3 py-2 text-right font-bold tabular-nums">{total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
