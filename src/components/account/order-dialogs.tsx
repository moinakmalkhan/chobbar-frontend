"use client";

import { ImagePlus } from "lucide-react";
import { useState } from "react";

import { QuantityStepper } from "@/components/shared/quantity";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label, Textarea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/misc";
import { useOrderActions } from "@/hooks/use-orders";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/api";

export function CancelDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useI18n();
  const { cancel } = useOrderActions(order.id);
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogHeader>
          <DialogTitle>{t("account.cancelConfirm")}</DialogTitle>
          <DialogDescription>{t("account.cancelHint")}</DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="cancel-reason">{t("account.cancelReason")}</Label>
          <Textarea
            id="cancel-reason"
            rows={3}
            maxLength={300}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("account.keepOrder")}
          </Button>
          <Button
            variant="destructive"
            loading={cancel.isPending}
            onClick={() => cancel.mutate(reason, { onSuccess: () => onOpenChange(false) })}
          >
            {t("account.cancelOrder")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const REASONS = ["size", "defect", "not_as_described", "changed_mind", "wrong_item", "other"] as const;

export function ReturnDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useI18n();
  const { requestReturn } = useOrderActions(order.id);
  const eligible = order.items.filter((i) => i.quantity - i.returned_quantity > 0);
  const [kind, setKind] = useState<"refund" | "exchange">("exchange");
  const [reason, setReason] = useState<(typeof REASONS)[number]>("size");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const chosen = Object.entries(picked).filter(([, q]) => q > 0);

  const submit = () => {
    const form = new FormData();
    form.append("kind", kind);
    form.append("reason", reason);
    form.append("details", details);
    form.append("items", JSON.stringify(chosen.map(([order_item, quantity]) => ({ order_item, quantity }))));
    if (image) form.append("image", image);
    requestReturn.mutate(form, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        side="bottom"
        className="sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[min(560px,calc(100%-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border"
        closeLabel={t("common.close")}
      >
        <DialogHeader>
          <DialogTitle>{t("account.returnTitle")}</DialogTitle>
          <DialogDescription dir="ltr" className="rtl:text-right">
            {order.number}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>{t("account.returnKind")}</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["exchange", "refund"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kind === k}
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-2xl border p-3 text-sm font-semibold transition-all",
                  kind === k ? "border-foreground ring-foreground ring-1" : "border-border",
                )}
              >
                {t(k === "refund" ? "account.refund" : "account.exchange")}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>{t("account.returnItems")}</Label>
          <ul className="space-y-2">
            {eligible.map((item) => {
              const max = item.quantity - item.returned_quantity;
              const q = picked[item.id] ?? 0;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-2.5 transition-colors",
                    q ? "border-foreground/40 bg-muted/50" : "border-border",
                  )}
                >
                  <Checkbox
                    checked={q > 0}
                    onCheckedChange={(v) => setPicked((p) => ({ ...p, [item.id]: v ? 1 : 0 }))}
                    aria-label={item.product_name}
                  />
                  <SmartImage
                    src={item.image_url}
                    alt=""
                    width={40}
                    height={50}
                    wrapperClassName="h-[50px] w-10 shrink-0 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.product_name}</p>
                    <p className="text-muted-foreground text-xs">{item.variant_label}</p>
                  </div>
                  {q > 0 && max > 1 ? (
                    <QuantityStepper
                      size="sm"
                      value={q}
                      max={max}
                      onChange={(v) => setPicked((p) => ({ ...p, [item.id]: v }))}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <Label htmlFor="reason">{t("account.returnReason")}</Label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as (typeof REASONS)[number])}
            className="border-border bg-card focus:border-brand-500 h-12 w-full rounded-xl border px-3 text-sm outline-none"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {t(`account.reasons.${r}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="details">{t("account.returnDetails")}</Label>
          <Textarea id="details" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>
        <label className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 text-sm">
          <ImagePlus className="size-4" />
          {image ? image.name : t("reviews.addPhoto")}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          />
        </label>
        <Button
          size="lg"
          className="w-full"
          disabled={!chosen.length}
          loading={requestReturn.isPending}
          onClick={submit}
        >
          {t("account.returnSubmit")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
