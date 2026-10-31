"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, FileUp, Layers, MessageSquareQuote, Ruler, ShoppingBag, Sparkles, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { FabricPicker } from "@/components/catalog/fabric-picker";
import { ImageGallery } from "@/components/catalog/image-gallery";
import { PriceSummary } from "@/components/catalog/price-summary";
import { type Matrix, matrixToBreakdown, SizeMatrix } from "@/components/catalog/size-matrix";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/misc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useCartMutations } from "@/hooks/use-cart";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { toApiError } from "@/lib/api";
import { formatPercent, GENDER_LABELS } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { catalogService } from "@/services/catalog";
import type { ProductDetail } from "@/types/api";

export function ProductConfigurator({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const { company } = useAuth();
  const { add } = useCartMutations();
  const defaultFabric = product.fabric_options.find((o) => o.is_default)?.fabric.slug ?? product.fabric_options[0]?.fabric.slug ?? "";
  const [fabric, setFabric] = useState(defaultFabric);
  const [matrix, setMatrix] = useState<Matrix>(() => {
    // Pre-fill a sensible starter run so first-time buyers see a price immediately.
    const first = product.genders[0];
    const sizes = product.size_options.filter((o) => o.gender === first).slice(0, 4);
    if (!sizes.length) return {};
    const per = Math.max(1, Math.ceil(product.min_order_quantity / sizes.length));
    return Object.fromEntries(sizes.map((o) => [`${first}:${o.size.id}`, per]));
  });
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [placements, setPlacements] = useState<string[]>([]);
  const [printMethod, setPrintMethod] = useState(product.customization_options.print_methods?.[0] ?? "");
  const [nameNumber, setNameNumber] = useState(false);
  const [notes, setNotes] = useState("");
  const [artwork, setArtwork] = useState<File | null>(null);
  const [intent, setIntent] = useState<"cart" | "quote" | null>(null);

  const breakdown = useMemo(() => matrixToBreakdown(matrix), [matrix]);
  const quantity = breakdown.reduce((n, l) => n + l.quantity, 0);
  const debounced = useDebouncedValue({ fabric, breakdown }, 350);
  const priceEnabled = debounced.breakdown.length > 0;

  const price = useQuery({
    queryKey: queryKeys.price({ product: product.slug, ...debounced, company: company?.id ?? null }),
    queryFn: () => catalogService.price({ product: product.slug, fabric: debounced.fabric, breakdown: debounced.breakdown }),
    enabled: priceEnabled,
    placeholderData: (prev) => prev,
    retry: false,
    staleTime: 60_000,
  });
  const priceError = price.error ? toApiError(price.error).detail : null;
  const belowMoq = quantity > 0 && quantity < product.min_order_quantity;
  const fabricOption = product.fabric_options.find((o) => o.fabric.slug === fabric);

  const customization = { color, logo_placements: placements, print_method: printMethod, name_and_number: nameNumber };

  const submit = (mode: "cart" | "quote") => {
    if (!breakdown.length) return notify.warning("Enter quantities", "Add at least one size to continue.");
    if (belowMoq) return notify.warning("Below minimum order", `This product needs at least ${product.min_order_quantity} pieces.`);
    setIntent(mode);
    add.mutate(
      { product: product.slug, fabric, breakdown, color, customization, notes, artwork },
      {
        onSuccess: () => {
          if (mode === "quote") router.push("/cart?quote=1");
        },
        onSettled: () => setIntent(null),
      },
    );
  };

  return (
    <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ImageGallery images={product.images} name={product.name} />
        <div className="mt-6 hidden lg:block">
          <ProductInfoTabs product={product} />
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="soft">{product.category_name}</Badge>
          {product.is_new ? <Badge variant="brand"><Sparkles className="size-3" /> New</Badge> : null}
          {product.is_featured ? <Badge variant="dark">Best seller</Badge> : null}
          <span className="text-xs text-muted-foreground">SKU {product.sku}</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{product.name}</h1>
        <p className="mt-2 text-muted-foreground">{product.short_description}</p>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <Fact icon={Layers} label="Minimum" value={`${product.min_order_quantity} pcs`} />
          <Fact icon={Clock} label="Lead time" value={`${product.lead_time_days} days`} />
          <Fact icon={Truck} label="Ships from" value="Sialkot, PK" />
        </dl>

        <Step n={1} title="Choose your fabric" hint="Price per piece follows the mill rate of the fabric you pick.">
          <FabricPicker options={product.fabric_options} value={fabric} onChange={setFabric} currency={company?.currency} />
          {fabricOption ? <p className="mt-2 text-xs text-muted-foreground">{fabricOption.fabric.description}</p> : null}
        </Step>

        <Step n={2} title="Enter quantities by size and gender" hint={`Mix freely — minimum ${product.min_order_quantity} pieces in total${product.order_increment > 1 ? `, in multiples of ${product.order_increment}` : ""}.`}>
          <SizeMatrix product={product} value={matrix} onChange={setMatrix} />
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Ruler className="size-3.5" /> Size chart: {product.size_group.name}</span>
            <span>Available for {product.genders.map((g) => GENDER_LABELS[g]).join(", ")}</span>
            {product.volume_tiers.length ? <span>Volume tiers: {product.volume_tiers.map((t) => `${t.min_quantity}+ −${formatPercent(t.discount_percent)}`).join(" · ")}</span> : null}
          </div>
        </Step>

        {product.is_customizable ? (
          <Step n={3} title="Customise" hint="Tell us how you'd like it decorated. Artwork can also be sent later via chat.">
            <div className="grid gap-4 sm:grid-cols-2">
              {product.colors.length ? (
                <div>
                  <Label>Base colour</Label>
                  <Select value={color} onValueChange={setColor}>
                    <SelectTrigger><SelectValue placeholder="Choose a colour" /></SelectTrigger>
                    <SelectContent>{product.colors.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ) : null}
              {product.customization_options.print_methods?.length ? (
                <div>
                  <Label>Decoration method</Label>
                  <Select value={printMethod} onValueChange={setPrintMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{product.customization_options.print_methods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>
            {product.customization_options.logo_placements?.length ? (
              <div className="mt-4">
                <Label>Logo placements</Label>
                <div className="flex flex-wrap gap-2">
                  {product.customization_options.logo_placements.map((p) => {
                    const on = placements.includes(p);
                    return (
                      <button key={p} type="button" onClick={() => setPlacements(on ? placements.filter((x) => x !== p) : [...placements, p])} className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${on ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300" : "border-border hover:border-ink-400"}`} aria-pressed={on}>{p}</button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {product.customization_options.name_number ? (
              <label className="mt-4 flex items-center gap-2.5 text-sm"><Checkbox checked={nameNumber} onCheckedChange={(v) => setNameNumber(Boolean(v))} /> Add player names &amp; numbers (send the list after ordering)</label>
            ) : null}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="artwork">Artwork (PNG, SVG, PDF, AI)</Label>
                <label htmlFor="artwork" className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-3 text-sm text-muted-foreground hover:border-brand-400 hover:text-foreground">
                  <FileUp className="size-4" /> <span className="truncate">{artwork ? artwork.name : "Upload a file"}</span>
                </label>
                <Input id="artwork" type="file" className="hidden" accept="image/*,.pdf,.ai,.eps,.svg" onChange={(e) => setArtwork(e.target.files?.[0] ?? null)} />
              </div>
              <div>
                <Label htmlFor="notes">Notes for production</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 500))} placeholder="Pantone codes, sponsor positions, special requests…" className="min-h-11" rows={1} />
              </div>
            </div>
          </Step>
        ) : null}

        <div className="mt-8 space-y-4">
          <PriceSummary price={price.data ?? null} loading={price.isFetching} error={priceError} moq={product.min_order_quantity} quantity={quantity} />
          <div className="grid gap-2 sm:grid-cols-2">
            <Button size="lg" onClick={() => submit("cart")} loading={add.isPending && intent === "cart"} disabled={!quantity || belowMoq}><ShoppingBag /> Add to order</Button>
            <Button size="lg" variant="outline" onClick={() => submit("quote")} loading={add.isPending && intent === "quote"} disabled={!quantity || belowMoq}><MessageSquareQuote /> Request a quote</Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Prices are wholesale, ex-works. {company ? `Showing ${company.name} pricing.` : <><Link href="/login" className="font-medium text-brand-600 underline">Sign in</Link> to see your company's negotiated rates.</>}
          </p>
        </div>

        <div className="mt-10 lg:hidden"><ProductInfoTabs product={product} /></div>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <Icon className="size-4 text-brand-500" />
      <div><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold">{value}</dd></div>
    </div>
  );
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-bold text-white dark:bg-white dark:text-ink-900">{n}</span>
        <div><h2 className="font-display text-lg font-bold leading-tight">{title}</h2>{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}</div>
      </div>
      {children}
    </section>
  );
}

function ProductInfoTabs({ product }: { product: ProductDetail }) {
  const specs = Object.entries(product.specifications ?? {});
  return (
    <Tabs defaultValue="details">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="sizes">Size chart</TabsTrigger>
        <TabsTrigger value="shipping">Shipping & payment</TabsTrigger>
      </TabsList>
      <TabsContent value="details" className="space-y-4 text-sm text-muted-foreground">
        <p>{product.description}</p>
        {specs.length ? (
          <dl className="grid grid-cols-2 gap-2">
            {specs.map(([k, v]) => <div key={k} className="rounded-xl bg-muted p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium text-foreground">{v}</dd></div>)}
          </dl>
        ) : null}
        {product.tags.length ? <p className="flex flex-wrap gap-1.5">{product.tags.map((t) => <Link key={t} href={`/products?tag=${t}`} className="rounded-full border border-border px-2 py-0.5 text-xs hover:border-brand-400">#{t}</Link>)}</p> : null}
      </TabsContent>
      <TabsContent value="sizes">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground"><tr><th className="px-3 py-2 text-left">Size</th><th className="px-3 py-2 text-left">Chest (cm)</th><th className="px-3 py-2 text-left">Length (cm)</th><th className="px-3 py-2 text-left">Surcharge</th></tr></thead>
            <tbody>
              {product.size_group.sizes.map((s) => (
                <tr key={s.id} className="border-t border-border"><td className="px-3 py-2 font-semibold">{s.label}</td><td className="px-3 py-2">{s.chest_cm || "—"}</td><td className="px-3 py-2">{s.length_cm || "—"}</td><td className="px-3 py-2">{Number(s.surcharge_percent) ? `+${s.surcharge_percent}%` : "—"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Measurements are garment measurements for a {product.size_group.name.toLowerCase()} fit. Need a custom spec? Mention it in production notes.</p>
      </TabsContent>
      <TabsContent value="shipping" className="space-y-2 text-sm text-muted-foreground">
        <p><strong className="text-foreground">Production:</strong> {product.lead_time_days} days after artwork and size approval{product.is_made_to_order ? ", made to order" : ""}.</p>
        <p><strong className="text-foreground">Freight:</strong> sea (30–45 days), air (7–12) or express (4–7), estimated by weight at checkout.</p>
        <p><strong className="text-foreground">Payment:</strong> bank transfer or 50% deposit for all accounts; net 15/30/60 for verified companies.</p>
        <p><strong className="text-foreground">Approvals:</strong> company admins can require approval above a spend threshold.</p>
      </TabsContent>
    </Tabs>
  );
}
