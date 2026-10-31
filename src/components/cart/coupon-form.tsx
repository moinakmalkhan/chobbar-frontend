"use client";

import { Tag, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useApplyCoupon, useRemoveCoupon } from "@/hooks/use-cart";
import { useI18n } from "@/i18n/client";
import type { Cart } from "@/types/api";

export function CouponForm({ cart, email }: { cart: Cart; email?: string }) {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const apply = useApplyCoupon();
  const remove = useRemoveCoupon();

  if (cart.coupon_code) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-emerald-500/50 bg-emerald-50 px-3.5 py-2.5 text-sm dark:bg-emerald-500/10">
        <span className="flex min-w-0 items-center gap-2">
          <Tag className="size-4 shrink-0 text-emerald-600" />
          <span className="min-w-0">
            <span className="font-bold tracking-wide" dir="ltr">
              {cart.coupon_code}
            </span>
            {cart.coupon_message ? (
              <span className="text-muted-foreground block truncate text-xs">{cart.coupon_message}</span>
            ) : null}
          </span>
        </span>
        <button
          type="button"
          onClick={() => remove.mutate(undefined)}
          disabled={remove.isPending}
          aria-label={t("cart.remove")}
          className="text-muted-foreground hover:text-foreground grid size-8 place-items-center rounded-full hover:bg-white/60 dark:hover:bg-white/10"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const value = code.trim();
        if (value) apply.mutate({ code: value, email }, { onSuccess: (c) => c.coupon_code && setCode("") });
      }}
      className="flex gap-2"
    >
      <label htmlFor="coupon" className="sr-only">
        {t("cart.coupon")}
      </label>
      <input
        id="coupon"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder={t("cart.couponPlaceholder")}
        autoCapitalize="characters"
        autoComplete="off"
        dir="ltr"
        className="border-border bg-card focus:border-brand-500 h-11 min-w-0 flex-1 rounded-full border px-4 text-sm tracking-wide uppercase transition-colors outline-none placeholder:tracking-normal placeholder:normal-case rtl:text-right"
      />
      <Button
        type="submit"
        variant="secondary"
        className="h-11"
        loading={apply.isPending}
        disabled={!code.trim()}
      >
        {t("cart.apply")}
      </Button>
    </form>
  );
}
