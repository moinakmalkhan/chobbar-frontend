"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/misc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import { useFabrics } from "@/hooks/use-catalog";
import { GENDER_LABELS, QUALITY_LABELS } from "@/lib/format";
import type { CategoryNode } from "@/types/api";

export const SORT_OPTIONS = [
  ["-is_featured,-order_count", "Recommended"],
  ["base_price", "Price: low to high"],
  ["-base_price", "Price: high to low"],
  ["min_order_quantity", "Lowest MOQ"],
  ["-created_at", "Newest"],
  ["name", "Name A–Z"],
] as const;

export function useFilterParams() {
  const params = useSearchParams();
  const router = useRouter();
  const set = useCallback(
    (updates: Record<string, string | string[] | null | undefined>, resetPage = true) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(updates)) {
        next.delete(key);
        if (Array.isArray(value)) value.forEach((v) => next.append(key, v));
        else if (value) next.set(key, value);
      }
      if (resetPage) next.delete("page");
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );
  return { params, set };
}

export function SortSelect() {
  const { params, set } = useFilterParams();
  const current = params.get("ordering") || SORT_OPTIONS[0][0];
  return (
    <Select value={current} onValueChange={(v) => set({ ordering: v === SORT_OPTIONS[0][0] ? null : v })}>
      <SelectTrigger className="h-10 w-[200px]" aria-label="Sort by">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function FilterPanel({ children: subcategories, priceRange }: { children?: CategoryNode[]; priceRange?: { min: number; max: number } }) {
  const { params, set } = useFilterParams();
  const { data: fabrics } = useFabrics();
  const genders = params.getAll("gender");
  const qualities = params.getAll("quality");
  const fabric = params.get("fabric")?.split(",").filter(Boolean) ?? [];
  const moq = params.get("max_moq") ?? "";

  const toggle = (key: string, value: string, current: string[]) => set({ [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
  const activeCount = genders.length + qualities.length + fabric.length + (params.get("min_price") ? 1 : 0) + (params.get("max_price") ? 1 : 0) + (moq ? 1 : 0);

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="size-4" /> Filters {activeCount ? <span className="rounded-full bg-brand-500 px-1.5 text-[10px] text-white">{activeCount}</span> : null}</h2>
        {activeCount ? <button type="button" onClick={() => set({ gender: null, quality: null, fabric: null, min_price: null, max_price: null, max_moq: null })} className="text-xs text-muted-foreground underline hover:text-foreground">Clear all</button> : null}
      </div>

      {subcategories?.length ? (
        <Group title="Category">
          <ul className="space-y-1.5">
            {subcategories.map((c) => (
              <li key={c.id}><a href={`/categories/${c.slug}`} className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground"><span>{c.name}</span><span className="text-xs">{c.product_count}</span></a></li>
            ))}
          </ul>
        </Group>
      ) : null}

      <Group title="Gender">
        {Object.entries(GENDER_LABELS).map(([value, label]) => (
          <CheckRow key={value} id={`g-${value}`} checked={genders.includes(value)} onChange={() => toggle("gender", value, genders)} label={label} />
        ))}
      </Group>

      <Group title="Fabric quality">
        {Object.entries(QUALITY_LABELS).map(([value, label]) => (
          <CheckRow key={value} id={`q-${value}`} checked={qualities.includes(value)} onChange={() => toggle("quality", value, qualities)} label={label} />
        ))}
      </Group>

      <Group title="Price per piece (from)">
        <PriceInputs key={`${params.get("min_price") ?? ""}|${params.get("max_price") ?? ""}`} min={params.get("min_price") ?? ""} max={params.get("max_price") ?? ""} priceRange={priceRange} onCommit={(u) => set(u)} />
      </Group>

      <Group title="Minimum order">
        <Select value={moq || "any"} onValueChange={(v) => set({ max_moq: v === "any" ? null : v })}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any MOQ</SelectItem>
            <SelectItem value="10">Up to 10 pcs</SelectItem>
            <SelectItem value="15">Up to 15 pcs</SelectItem>
            <SelectItem value="25">Up to 25 pcs</SelectItem>
            <SelectItem value="50">Up to 50 pcs</SelectItem>
          </SelectContent>
        </Select>
      </Group>

      {fabrics?.length ? (
        <Group title="Fabric">
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {fabrics.map((f) => (
              <CheckRow key={f.slug} id={`f-${f.slug}`} checked={fabric.includes(f.slug)} onChange={() => set({ fabric: (fabric.includes(f.slug) ? fabric.filter((v) => v !== f.slug) : [...fabric, f.slug]).join(",") || null })} label={<span className="flex items-center gap-2"><span className="size-3 rounded-full border border-border" style={{ background: f.swatch_color }} />{f.name}<span className="text-xs text-muted-foreground">{f.gsm}g</span></span>} />
            ))}
          </div>
        </Group>
      ) : null}
    </div>
  );
}

/** Local, debounced price inputs; remounted (via key) whenever the URL changes externally. */
function PriceInputs({ min: initialMin, max: initialMax, priceRange, onCommit }: { min: string; max: string; priceRange?: { min: number; max: number }; onCommit: (u: Record<string, string | null>) => void }) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  const debounced = useDebouncedCallback((u: Record<string, string | null>) => onCommit(u), 400);
  return (
    <div className="flex items-center gap-2">
      <input inputMode="decimal" value={min} onChange={(e) => { setMin(e.target.value); debounced({ min_price: e.target.value || null }); }} placeholder={priceRange ? `${Math.floor(priceRange.min)}` : "Min"} className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm" aria-label="Minimum price" />
      <span className="text-muted-foreground">–</span>
      <input inputMode="decimal" value={max} onChange={(e) => { setMax(e.target.value); debounced({ max_price: e.target.value || null }); }} placeholder={priceRange ? `${Math.ceil(priceRange.max)}` : "Max"} className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm" aria-label="Maximum price" />
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  );
}

function CheckRow({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: () => void; label: React.ReactNode }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-sm">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <span className="flex-1">{label}</span>
    </label>
  );
}

export function MobileFilters(props: React.ComponentProps<typeof FilterPanel>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpen(true)}><SlidersHorizontal /> Filters</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent side="bottom" className="max-h-[85dvh]">
          <DialogHeader><DialogTitle>Filters</DialogTitle></DialogHeader>
          <FilterPanel {...props} />
          <Button className="mt-2" onClick={() => setOpen(false)}>Show results</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ActiveFilterChips() {
  const { params, set } = useFilterParams();
  const chips: { key: string; value: string; label: string }[] = [];
  params.getAll("gender").forEach((g) => chips.push({ key: "gender", value: g, label: GENDER_LABELS[g] ?? g }));
  params.getAll("quality").forEach((q) => chips.push({ key: "quality", value: q, label: QUALITY_LABELS[q] ?? q }));
  (params.get("fabric")?.split(",").filter(Boolean) ?? []).forEach((f) => chips.push({ key: "fabric", value: f, label: f.replace(/-/g, " ") }));
  if (params.get("min_price")) chips.push({ key: "min_price", value: "", label: `Min $${params.get("min_price")}` });
  if (params.get("max_price")) chips.push({ key: "max_price", value: "", label: `Max $${params.get("max_price")}` });
  if (params.get("max_moq")) chips.push({ key: "max_moq", value: "", label: `MOQ ≤ ${params.get("max_moq")}` });
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={() => {
            if (chip.key === "gender" || chip.key === "quality") set({ [chip.key]: params.getAll(chip.key).filter((v) => v !== chip.value) });
            else if (chip.key === "fabric") set({ fabric: (params.get("fabric")?.split(",").filter((v) => v && v !== chip.value) ?? []).join(",") || null });
            else set({ [chip.key]: null });
          }}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium capitalize hover:border-ink-400"
        >
          {chip.label} <X className="size-3" />
        </button>
      ))}
    </div>
  );
}
