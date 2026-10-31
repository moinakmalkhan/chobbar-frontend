"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  Gift,
  Loader2,
  Lock,
  MapPin,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { CartTotals } from "@/components/cart/cart-totals";
import { CouponForm } from "@/components/cart/coupon-form";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldError, Hint, Input, Label, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/misc";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { usePaymentMethods } from "@/hooks/use-orders";
import { useI18n } from "@/i18n/client";
import { Link, useRouter } from "@/i18n/link";
import { fieldErrors } from "@/lib/api";
import { PK_CITIES, PK_PROVINCES, isValidPkPhone, provinceForCity } from "@/lib/pk";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { accountsService } from "@/services/accounts";
import { ordersService } from "@/services/orders";
import { useLocalStore } from "@/stores/local-store";
import type { Address, PaymentMethod } from "@/types/api";

export const LAST_ORDER_KEY = "chobbar.lastOrder";

function useSchema() {
  const { t } = useI18n();
  return useMemo(
    () =>
      z.object({
        email: z.string().trim().email(t("auth.invalidEmail")),
        phone: z.string().trim().refine(isValidPkPhone, t("checkout.invalidPhone")),
        full_name: z.string().trim().min(2, t("common.required")),
        line1: z.string().trim().min(4, t("common.required")),
        line2: z.string().trim().optional(),
        city: z.string().trim().min(2, t("common.required")),
        province: z.string().trim().optional(),
        postal_code: z.string().trim().optional(),
        notes: z.string().max(500).optional(),
        is_gift: z.boolean(),
        save_address: z.boolean(),
        payment_method: z.enum(["cod", "bank_transfer", "card"]),
      }),
    [t],
  );
}

type FormValues = z.infer<ReturnType<typeof useSchema>>;

const PAYMENT_ICONS: Record<PaymentMethod, typeof Banknote> = {
  cod: Banknote,
  bank_transfer: Building2,
  card: CreditCard,
};

export function CheckoutForm() {
  const { t, money, number } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, hydrated } = useAuth();
  const { data: cart, isLoading } = useCart();
  const methods = usePaymentMethods();
  const contact = useLocalStore((s) => s.checkoutContact);
  const saveContact = useLocalStore((s) => s.saveContact);
  const addresses = useQuery({
    queryKey: queryKeys.addresses,
    queryFn: accountsService.addresses,
    enabled: hydrated && isAuthenticated,
  });
  const [selectedAddress, setSelectedAddress] = useState<string | "new" | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const schema = useSchema();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      phone: "",
      full_name: "",
      line1: "",
      line2: "",
      city: "",
      province: "",
      postal_code: "",
      notes: "",
      is_gift: false,
      save_address: true,
      payment_method: "cod",
    },
    mode: "onTouched",
  });
  const { register, handleSubmit, setValue, setError, control, formState } = form;
  const { errors, isSubmitting } = formState;

  // Prefill: signed-in profile first, then what this device remembers from the last guest checkout.
  useEffect(() => {
    if (!hydrated) return;
    const current = form.getValues();
    const fill = (k: keyof FormValues, v?: string) => {
      if (v && !current[k]) setValue(k, v as never);
    };
    fill("email", user?.email ?? contact?.email);
    fill("phone", user?.phone || contact?.phone);
    fill("full_name", user?.full_name || contact?.full_name);
    fill("city", contact?.city);
    fill("province", contact?.province);
  }, [hydrated, user, contact, form, setValue]);

  const applyAddress = (a: Address) => {
    setValue("full_name", a.full_name);
    setValue("phone", a.phone);
    setValue("line1", a.line1);
    setValue("line2", a.line2);
    setValue("city", a.city);
    setValue("province", a.province);
    setValue("postal_code", a.postal_code);
    setValue("save_address", false);
  };

  // Default to the saved default address.
  useEffect(() => {
    if (selectedAddress !== null || !addresses.data) return;
    const def = addresses.data.find((a) => a.is_default) ?? addresses.data[0];
    if (def) {
      setSelectedAddress(def.id);
      applyAddress(def);
    } else setSelectedAddress("new");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.data, selectedAddress]);

  const [city, province, payment] = useWatch({ control, name: ["city", "province", "payment_method"] });
  const debouncedCity = useDebouncedValue(city?.trim() ?? "", 400);
  const debouncedProvince = useDebouncedValue(province ?? "", 400);
  const quote = useQuery({
    queryKey: queryKeys.shippingQuote({
      city: debouncedCity,
      province: debouncedProvince,
      payment,
      subtotal: cart?.subtotal,
      discount: cart?.discount,
    }),
    queryFn: () => ordersService.shippingQuote(debouncedCity, debouncedProvince, payment),
    enabled: debouncedCity.length >= 2 && !!cart?.items.length,
    staleTime: 60_000,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const order = await ordersService.checkout({
        email: values.email,
        payment_method: values.payment_method,
        notes: values.notes,
        is_gift: values.is_gift,
        save_address: isAuthenticated && selectedAddress === "new" && values.save_address,
        address: {
          full_name: values.full_name,
          phone: values.phone,
          line1: values.line1,
          line2: values.line2 ?? "",
          city: values.city,
          province: values.province ?? "",
          postal_code: values.postal_code ?? "",
          country: "PK",
        },
      });
      saveContact({
        email: values.email,
        phone: values.phone,
        full_name: values.full_name,
        city: values.city,
        province: values.province ?? "",
      });
      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
      } catch {
        /* storage full / private mode */
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
      notify.success(t("checkout.placed"), order.number);
      router.replace(`/checkout/success?order=${order.id}`);
    } catch (e) {
      const fields = fieldErrors(e);
      const address = (e as { response?: { data?: { errors?: { address?: Record<string, string[]> } } } })
        .response?.data?.errors?.address;
      if (address && typeof address === "object") {
        for (const [k, v] of Object.entries(address))
          setError(k as keyof FormValues, { message: Array.isArray(v) ? v[0] : String(v) });
      }
      for (const [k, v] of Object.entries(fields))
        if (k !== "address") setError(k as keyof FormValues, { message: v });
      notify.error(e);
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    }
  });

  if (isLoading || !hydrated) {
    return (
      <div className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-x py-10">
        <EmptyState
          icon={ShoppingBag}
          title={t("checkout.emptyBag")}
          description={t("cart.emptyHint")}
          action={
            <Button asChild>
              <Link href="/products">{t("common.shopNow")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const q = quote.data;
  const shipping = q ? q.rate : null;
  const codFee = q && payment === "cod" ? q.cod_fee : 0;
  const total = q ? q.total : cart.subtotal - cart.discount;
  const section = "rounded-3xl border border-border bg-card p-5 sm:p-6";
  const heading = "mb-5 flex items-center gap-3 font-display text-lg font-bold";
  const step = "grid size-7 place-items-center rounded-full bg-foreground text-xs font-bold text-background";
  const showForm = !isAuthenticated || selectedAddress === "new" || !addresses.data?.length;

  const summary = (
    <div className="space-y-5">
      <ul className="space-y-4">
        {cart.items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="relative shrink-0">
              <SmartImage
                src={item.product.image?.url}
                alt={item.product.name}
                width={64}
                height={80}
                wrapperClassName="h-20 w-16 rounded-xl"
              />
              <span className="bg-ink-700 absolute -end-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full px-1 text-[11px] leading-5 font-bold text-white">
                {number(item.quantity)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium">{item.product.name}</p>
              <p className="text-muted-foreground text-xs">{item.variant.label}</p>
            </div>
            <p className="text-sm font-semibold tabular-nums">{money(item.line_total)}</p>
          </li>
        ))}
      </ul>
      <CouponForm cart={cart} email={form.getValues("email") || undefined} />
      <CartTotals
        subtotal={cart.subtotal}
        discount={cart.discount}
        shipping={shipping}
        codFee={codFee}
        total={total}
        freeShipping={cart.free_shipping}
      />
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="container-x py-6 sm:py-10">
      <h1 className="font-display mb-6 text-3xl font-extrabold">{t("checkout.title")}</h1>

      {/* Phone: collapsible summary on top */}
      <div className="border-border bg-card mb-6 rounded-3xl border lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 p-4"
          aria-expanded={summaryOpen}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingBag className="size-4" />
            {t("checkout.summary")}
            <ChevronDown className={cn("size-4 transition-transform", summaryOpen && "rotate-180")} />
          </span>
          <span className="font-bold tabular-nums">{money(total)}</span>
        </button>
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300",
            summaryOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="border-border border-t p-4">{summary}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-10">
        <div className="space-y-6">
          <section className={section}>
            <h2 className={heading}>
              <span className={step}>1</span>
              {t("checkout.contact")}
            </h2>
            {!isAuthenticated ? (
              <p className="text-muted-foreground -mt-2 mb-4 text-sm">
                {t("checkout.signInPrompt")}{" "}
                <Link
                  href="/login?next=/checkout"
                  className="text-foreground font-semibold underline underline-offset-4"
                >
                  {t("nav.signIn")}
                </Link>
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">{t("checkout.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="phone">{t("checkout.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  placeholder="03xx xxxxxxx"
                  invalid={!!errors.phone}
                  {...register("phone")}
                  className="rtl:text-right"
                />
                {errors.phone ? (
                  <FieldError>{errors.phone.message}</FieldError>
                ) : (
                  <Hint>{t("checkout.phoneHint")}</Hint>
                )}
              </div>
            </div>
          </section>

          <section className={section}>
            <h2 className={heading}>
              <span className={step}>2</span>
              {t("checkout.delivery")}
            </h2>
            {isAuthenticated && addresses.data?.length ? (
              <div
                className="mb-5 grid gap-3 sm:grid-cols-2"
                role="radiogroup"
                aria-label={t("checkout.savedAddresses")}
              >
                {addresses.data.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={selectedAddress === a.id}
                    onClick={() => {
                      setSelectedAddress(a.id);
                      applyAddress(a);
                    }}
                    className={cn(
                      "relative rounded-2xl border p-4 text-start text-sm transition-all",
                      selectedAddress === a.id
                        ? "border-foreground ring-foreground ring-1"
                        : "border-border hover:border-foreground/40",
                    )}
                  >
                    <p className="flex items-center gap-2 font-semibold">
                      <MapPin className="size-4" />
                      {a.full_name}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      {[a.line1, a.line2, a.city].filter(Boolean).join(", ")}
                    </p>
                    <p className="text-muted-foreground" dir="ltr">
                      {a.phone}
                    </p>
                    {selectedAddress === a.id ? (
                      <Check className="text-brand-600 absolute end-3 top-3 size-4" />
                    ) : null}
                  </button>
                ))}
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedAddress === "new"}
                  onClick={() => {
                    setSelectedAddress("new");
                    (["line1", "line2", "postal_code"] as const).forEach((k) => setValue(k, ""));
                    setValue("save_address", true);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border border-dashed p-4 text-sm font-semibold transition-all",
                    selectedAddress === "new"
                      ? "border-foreground"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  <Plus className="size-4" />
                  {t("checkout.newAddress")}
                </button>
              </div>
            ) : null}
            <div className={cn("grid gap-4 sm:grid-cols-2", !showForm && "hidden")}>
              <div className="sm:col-span-2">
                <Label htmlFor="full_name">{t("checkout.fullName")}</Label>
                <Input
                  id="full_name"
                  autoComplete="name"
                  invalid={!!errors.full_name}
                  {...register("full_name")}
                />
                <FieldError>{errors.full_name?.message}</FieldError>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="line1">{t("checkout.line1")}</Label>
                <Input
                  id="line1"
                  autoComplete="address-line1"
                  invalid={!!errors.line1}
                  {...register("line1")}
                />
                <FieldError>{errors.line1?.message}</FieldError>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="line2">
                  {t("checkout.line2")}{" "}
                  <span className="text-muted-foreground font-normal">({t("common.optional")})</span>
                </Label>
                <Input id="line2" autoComplete="address-line2" {...register("line2")} />
              </div>
              <div>
                <Label htmlFor="city">{t("checkout.city")}</Label>
                <Input
                  id="city"
                  list="pk-cities"
                  autoComplete="address-level2"
                  invalid={!!errors.city}
                  {...register("city", {
                    onChange: (e) => {
                      const p = provinceForCity(e.target.value);
                      if (p) setValue("province", p);
                    },
                  })}
                />
                <datalist id="pk-cities">
                  {Object.keys(PK_CITIES).map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <FieldError>{errors.city?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="province">{t("checkout.province")}</Label>
                <select
                  id="province"
                  autoComplete="address-level1"
                  {...register("province")}
                  className="border-border bg-card focus:border-brand-500 h-12 w-full rounded-xl border px-3 text-[15px] outline-none sm:text-sm"
                >
                  <option value="">—</option>
                  {PK_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="postal_code">
                  {t("checkout.postalCode")}{" "}
                  <span className="text-muted-foreground font-normal">({t("common.optional")})</span>
                </Label>
                <Input
                  id="postal_code"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  dir="ltr"
                  {...register("postal_code")}
                  className="rtl:text-right"
                />
              </div>
              {isAuthenticated ? (
                <label className="flex items-center gap-2.5 self-end pb-3 text-sm">
                  <Checkbox
                    checked={form.watch("save_address")}
                    onCheckedChange={(v) => setValue("save_address", v === true)}
                  />
                  {t("checkout.saveAddress")}
                </label>
              ) : null}
            </div>

            <div className="bg-surface mt-5 rounded-2xl p-4" aria-live="polite">
              {debouncedCity.length < 2 ? (
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Truck className="size-4" />
                  {t("checkout.enterCity")}
                </p>
              ) : quote.isFetching && !q ? (
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Loader2 className="size-4 animate-spin" />
                  {t("common.loading")}
                </p>
              ) : q ? (
                <div className="animate-in fade-in flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <Truck className="text-brand-600 size-4" />
                    <span>
                      <span className="font-semibold">{q.zone}</span>
                      <span className="text-muted-foreground block text-xs">
                        {t("checkout.eta", { min: number(q.min_days), max: number(q.max_days) })}
                      </span>
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums">
                    {q.rate === 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400">{t("common.free")}</span>
                    ) : (
                      money(q.rate)
                    )}
                  </span>
                </div>
              ) : null}
            </div>
          </section>

          <section className={section}>
            <h2 className={heading}>
              <span className={step}>3</span>
              {t("checkout.payment")}
            </h2>
            <div className="grid gap-3" role="radiogroup" aria-label={t("checkout.payment")}>
              {(
                methods.data ?? [
                  {
                    code: "cod" as const,
                    label: t("checkout.cod"),
                    description: t("checkout.codHint"),
                    enabled: true,
                  },
                  {
                    code: "bank_transfer" as const,
                    label: t("checkout.bank"),
                    description: t("checkout.bankHint"),
                    enabled: true,
                  },
                ]
              ).map((m) => {
                const Icon = PAYMENT_ICONS[m.code];
                const on = payment === m.code;
                const label =
                  m.code === "cod"
                    ? t("checkout.cod")
                    : m.code === "bank_transfer"
                      ? t("checkout.bank")
                      : t("checkout.card");
                const hint =
                  m.code === "cod"
                    ? t("checkout.codHint")
                    : m.code === "bank_transfer"
                      ? t("checkout.bankHint")
                      : t("checkout.cardHint");
                return (
                  <button
                    key={m.code}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={!m.enabled}
                    onClick={() => setValue("payment_method", m.code)}
                    className={cn(
                      "flex items-start gap-4 rounded-2xl border p-4 text-start transition-all disabled:cursor-not-allowed disabled:opacity-50",
                      on
                        ? "border-foreground ring-foreground ring-1"
                        : "border-border hover:border-foreground/40",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-xl",
                        on ? "bg-brand-600 text-white" : "bg-muted",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center justify-between gap-2 font-semibold">
                        {label}
                        {m.code === "cod" && q?.cod_fee ? (
                          <span className="text-muted-foreground text-xs font-normal">
                            +{money(q.cod_fee)}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-muted-foreground mt-0.5 block text-sm">{hint}</span>
                    </span>
                    <span
                      className={cn(
                        "mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2",
                        on ? "border-brand-600" : "border-border",
                      )}
                    >
                      {on ? <span className="bg-brand-600 size-2.5 rounded-full" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="notes">
                  {t("checkout.notes")}{" "}
                  <span className="text-muted-foreground font-normal">({t("common.optional")})</span>
                </Label>
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder={t("checkout.notesPlaceholder")}
                  {...register("notes")}
                />
              </div>
              <label className="flex items-center gap-2.5 text-sm">
                <Checkbox
                  checked={form.watch("is_gift")}
                  onCheckedChange={(v) => setValue("is_gift", v === true)}
                />
                <Gift className="text-brand-600 size-4" />
                {t("checkout.gift")}
              </label>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border-border bg-card hidden rounded-3xl border p-6 lg:block">
            <h2 className="font-display mb-5 text-lg font-bold">{t("checkout.summary")}</h2>
            {summary}
          </div>
          <div className="border-border safe-bottom fixed inset-x-0 bottom-0 z-30 border-t bg-[var(--header)] p-3 backdrop-blur-md lg:static lg:mt-4 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              <Lock />
              {isSubmitting ? t("checkout.placing") : t("checkout.placeOrder", { amount: money(total) })}
            </Button>
            <p className="text-muted-foreground mt-2 hidden text-center text-xs lg:block">
              {t("checkout.agree")}
            </p>
          </div>
          <div aria-hidden className="h-20 lg:hidden" />
        </aside>
      </div>
    </form>
  );
}
