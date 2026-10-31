"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, PackageSearch, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { OrderProgress, Timeline } from "@/components/orders/order-progress";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";
import { useRouter } from "@/i18n/link";
import { toApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { ordersService } from "@/services/orders";

export function TrackOrder() {
  const { t, money, date, number: num } = useI18n();
  const sp = useSearchParams();
  const router = useRouter();
  const number = (sp.get("number") ?? "").toUpperCase();
  const contact = sp.get("contact") ?? "";
  const [n, setN] = useState(number);
  const [c, setC] = useState(contact);
  const query = useQuery({
    queryKey: queryKeys.tracking(number, contact),
    queryFn: () => ordersService.track(number, contact),
    enabled: !!number && !!contact,
    retry: false,
  });
  const info = query.data;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <span className="bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 mx-auto mb-4 grid size-14 place-items-center rounded-2xl">
          <PackageSearch className="size-7" />
        </span>
        <h1 className="font-display text-3xl font-extrabold">{t("track.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("track.subtitle")}</p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (n.trim() && c.trim())
            router.replace(
              `/track?number=${encodeURIComponent(n.trim().toUpperCase())}&contact=${encodeURIComponent(c.trim())}`,
            );
        }}
        className="border-border bg-card grid gap-4 rounded-3xl border p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6"
      >
        <div>
          <Label htmlFor="number">{t("track.orderNumber")}</Label>
          <Input
            id="number"
            value={n}
            onChange={(e) => setN(e.target.value)}
            placeholder="CH-2026-000123"
            dir="ltr"
            required
            className="uppercase rtl:text-right"
          />
        </div>
        <div>
          <Label htmlFor="contact">{t("track.contact")}</Label>
          <Input id="contact" value={c} onChange={(e) => setC(e.target.value)} required />
        </div>
        <Button type="submit" size="lg" loading={query.isFetching}>
          <Search />
          {t("track.submit")}
        </Button>
      </form>

      {query.isError ? (
        <p className="animate-in fade-in mt-6 rounded-2xl bg-red-50 p-4 text-center text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {toApiError(query.error).detail}
        </p>
      ) : null}

      {info ? (
        <div className="animate-rise mt-8 space-y-6">
          <div className="border-border bg-card rounded-3xl border p-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-xl font-bold" dir="ltr">
                {info.number}
              </p>
              <p className="text-muted-foreground text-sm">{t(`status.${info.status}`)}</p>
            </div>
            <OrderProgress status={info.status} />
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
              {info.estimated_delivery ? (
                <div>
                  <dt className="text-muted-foreground">{t("track.estimated")}</dt>
                  <dd className="font-semibold">{date(info.estimated_delivery)}</dd>
                </div>
              ) : null}
              {info.carrier ? (
                <div>
                  <dt className="text-muted-foreground">{t("track.courier")}</dt>
                  <dd className="font-semibold">
                    {info.carrier}{" "}
                    {info.tracking_number ? <span dir="ltr">· {info.tracking_number}</span> : null}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">{t("track.deliverTo")}</dt>
                <dd className="font-semibold">
                  {info.ship_to.name}, {info.ship_to.city}
                </dd>
              </div>
            </dl>
            {info.tracking_url ? (
              <Button asChild variant="outline" className="mt-5">
                <a href={info.tracking_url} target="_blank" rel="noopener noreferrer">
                  {t("track.trackWithCourier")}
                  <ExternalLink />
                </a>
              </Button>
            ) : null}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-border bg-card rounded-3xl border p-5 sm:p-6">
              <h2 className="mb-5 font-semibold">{t("account.timeline")}</h2>
              <Timeline entries={info.timeline} />
            </div>
            <div className="border-border bg-card rounded-3xl border p-5 sm:p-6">
              <ul className="space-y-3">
                {info.items.map((i, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <SmartImage
                      src={i.image_url}
                      alt={i.name}
                      width={48}
                      height={60}
                      wrapperClassName="h-[60px] w-12 shrink-0 rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{i.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {i.variant} × {num(i.quantity)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-border mt-5 flex justify-between border-t pt-4 font-semibold">
                <span>{t("cart.total")}</span>
                <span className="tabular-nums">{money(info.grand_total)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
