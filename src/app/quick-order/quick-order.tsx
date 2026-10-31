"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardPaste, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { uid } from "@/lib/utils";
import { cartService } from "@/services/cart";
import { useCartStore } from "@/stores/cart-store";

interface Line { id: string; sku: string; gender: string; size: string; quantity: string }
const blank = (): Line => ({ id: uid(), sku: "", gender: "men", size: "", quantity: "" });

export function QuickOrder() {
  const [lines, setLines] = useState<Line[]>([blank(), blank(), blank()]);
  const [paste, setPaste] = useState("");
  const [errors, setErrors] = useState<{ sku: string; error: string }[]>([]);
  const queryClient = useQueryClient();
  const openDrawer = useCartStore((s) => s.openDrawer);

  const submit = useMutation({
    mutationFn: () => cartService.quickOrder(lines.filter((l) => l.sku.trim() && l.size.trim() && Number(l.quantity) > 0).map((l) => ({ sku: l.sku.trim(), gender: l.gender, size: l.size.trim(), quantity: Number(l.quantity) }))),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cart, data.cart);
      setErrors(data.errors);
      if (data.added) notify.action("Added to cart", `${data.added} product line(s) priced and added.`, { label: "View cart", onClick: openDrawer });
      if (data.errors.length) notify.warning(`${data.errors.length} line(s) need attention`, "See the list below.");
    },
    onError: (e) => notify.error(e, "Couldn't add lines"),
  });

  const parsePaste = () => {
    const parsed: Line[] = paste.split(/\r?\n/).map((row) => row.trim()).filter(Boolean).map((row) => {
      const [sku = "", gender = "men", size = "", quantity = ""] = row.split(/[\t,;]+/).map((c) => c.trim());
      return { id: uid(), sku, gender: gender.toLowerCase(), size, quantity };
    });
    if (!parsed.length) return notify.warning("Nothing to import", "Paste rows like: LS-SOC-001, men, XL, 12");
    setLines(parsed);
    setPaste("");
    notify.success(`${parsed.length} lines imported`);
  };

  const setLine = (id: string, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const valid = lines.filter((l) => l.sku.trim() && l.size.trim() && Number(l.quantity) > 0).length;

  return (
    <div className="container-x py-8 lg:py-12">
      <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Quick order</p><h1 className="font-display text-3xl font-bold">Order by SKU</h1><p className="mt-2 text-muted-foreground">Know what you need? Enter SKU, gender, size and quantity — or paste straight from a spreadsheet. Lines are grouped per product and priced with your fabric default and volume tiers.</p></div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="hidden grid-cols-[1.6fr_1fr_1fr_0.8fr_auto] gap-2 px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid"><span>SKU</span><span>Gender</span><span>Size</span><span>Qty</span><span /></div>
          <div className="space-y-2">
            {lines.map((l) => (
              <div key={l.id} className="grid grid-cols-2 gap-2 rounded-xl border border-border p-2 sm:grid-cols-[1.6fr_1fr_1fr_0.8fr_auto] sm:border-0 sm:p-0">
                <Input value={l.sku} onChange={(e) => setLine(l.id, { sku: e.target.value.toUpperCase() })} placeholder="LS-SOC-001" className="h-10 font-mono text-xs uppercase" aria-label="SKU" />
                <select value={l.gender} onChange={(e) => setLine(l.id, { gender: e.target.value })} className="h-10 rounded-xl border border-border bg-background px-2 text-sm" aria-label="Gender">{["men", "women", "unisex", "youth", "boys", "girls"].map((g) => <option key={g} value={g}>{g}</option>)}</select>
                <Input value={l.size} onChange={(e) => setLine(l.id, { size: e.target.value.toUpperCase() })} placeholder="XL" className="h-10 uppercase" aria-label="Size" />
                <Input value={l.quantity} onChange={(e) => setLine(l.id, { quantity: e.target.value.replace(/\D/g, "") })} inputMode="numeric" placeholder="0" className="h-10" aria-label="Quantity" />
                <Button type="button" variant="ghost" size="icon" className="h-10 justify-self-end text-muted-foreground" onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))} aria-label="Remove line"><Trash2 /></Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setLines((ls) => [...ls, blank()])}><Plus /> Add line</Button>
            <Button type="button" size="sm" onClick={() => submit.mutate()} loading={submit.isPending} disabled={!valid}><Upload /> Add {valid || ""} line{valid === 1 ? "" : "s"} to cart</Button>
          </div>
          {errors.length ? (
            <ul className="mt-4 space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              {errors.map((e, i) => <li key={i}><span className="font-mono font-semibold">{e.sku}</span>: {e.error}</li>)}
            </ul>
          ) : null}
        </section>
        <aside className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold"><ClipboardPaste className="size-5 text-brand-500" /> Paste from spreadsheet</h2>
          <p className="mt-1 text-xs text-muted-foreground">One line per row: <code className="rounded bg-muted px-1">SKU, gender, size, qty</code> — commas, tabs or semicolons.</p>
          <Label htmlFor="paste" className="sr-only">Rows</Label>
          <Textarea id="paste" value={paste} onChange={(e) => setPaste(e.target.value)} className="mt-3 min-h-40 font-mono text-xs" placeholder={"LS-SOC-001\tmen\tL\t12\nLS-SOC-001\twomen\tM\t8\nLS-SOC-002\tyouth\tYL\t10"} />
          <Button type="button" className="mt-3 w-full" variant="secondary" onClick={parsePaste} disabled={!paste.trim()}>Import rows</Button>
          <p className="mt-4 text-xs text-muted-foreground">Find SKUs on any product page or in your past orders. Fabric and colour default to the product standard — adjust them in the cart.</p>
        </aside>
      </div>
    </div>
  );
}
