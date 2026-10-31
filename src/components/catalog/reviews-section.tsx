"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, ImagePlus, MessageSquareQuote, Star, ThumbsUp } from "lucide-react";
import { useState } from "react";

import { Rating } from "@/components/shared/rating";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { reviewsService } from "@/services/reviews";

export function ReviewDialog({
  productSlug,
  productName,
  open,
  onOpenChange,
  defaultSize,
}: {
  productSlug: string;
  productName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultSize?: string;
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fit, setFit] = useState<"" | "small" | "true" | "large">("");
  const [image, setImage] = useState<File | null>(null);
  const create = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append("product", productSlug);
      form.append("rating", String(rating));
      form.append("title", title);
      form.append("body", body);
      form.append("fit", fit);
      if (defaultSize) form.append("size_purchased", defaultSize);
      if (image) form.append("image", image);
      return reviewsService.create(form);
    },
    onSuccess: (review) => {
      notify.success(t("reviews.thanks"), review.status === "approved" ? undefined : t("reviews.pending"));
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.product(productSlug) });
      onOpenChange(false);
      setRating(0);
      setTitle("");
      setBody("");
      setFit("");
      setImage(null);
    },
    onError: (e) => notify.error(e),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t("common.close")}>
        <DialogHeader>
          <DialogTitle>{t("reviews.write")}</DialogTitle>
          <DialogDescription>{productName}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!rating) {
              notify.warning(t("reviews.yourRating"));
              return;
            }
            create.mutate();
          }}
        >
          <div>
            <Label>{t("reviews.yourRating")}</Label>
            <div className="flex gap-1" dir="ltr" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onClick={() => setRating(i)}
                  aria-label={`${i}`}
                  className="p-0.5 transition-transform active:scale-90"
                >
                  <Star
                    className={cn(
                      "size-8 transition-colors",
                      i <= (hover || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-ink-300 dark:text-ink-600",
                    )}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="r-title">{t("reviews.reviewTitle")}</Label>
            <Input id="r-title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="r-body">{t("reviews.reviewBody")}</Label>
            <Textarea
              id="r-body"
              value={body}
              maxLength={3000}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label>{t("reviews.fit")}</Label>
            <div className="flex flex-wrap gap-2">
              {(["small", "true", "large"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFit(fit === f ? "" : f)}
                  aria-pressed={fit === f}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm",
                    fit === f ? "border-foreground bg-foreground text-background" : "border-border",
                  )}
                >
                  {t(
                    f === "small"
                      ? "reviews.fitSmall"
                      : f === "true"
                        ? "reviews.fitTrue"
                        : "reviews.fitLarge",
                  )}
                </button>
              ))}
            </div>
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
          <Button type="submit" className="w-full" loading={create.isPending}>
            {t("reviews.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewsSection({ productSlug, productName }: { productSlug: string; productName: string }) {
  const { t, number, date } = useI18n();
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<number | undefined>();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const summary = useQuery({
    queryKey: queryKeys.reviewSummary(productSlug),
    queryFn: () => reviewsService.summary(productSlug),
    staleTime: 5 * 60_000,
  });
  const params = { product: productSlug, page, rating };
  const list = useQuery({
    queryKey: queryKeys.reviews(params),
    queryFn: () => reviewsService.list(params),
    placeholderData: keepPreviousData,
  });
  const helpful = useMutation({
    mutationFn: reviewsService.helpful,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
    onError: (e) => notify.error(e),
  });

  const s = summary.data;
  return (
    <section id="reviews" className="container-x scroll-mt-24 pt-16 sm:pt-20">
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div data-reveal>
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{t("reviews.title")}</h2>
          {summary.isLoading ? (
            <Skeleton className="mt-6 h-40" />
          ) : s && s.total ? (
            <div className="mt-6">
              <div className="flex items-end gap-3">
                <span className="font-display text-5xl font-extrabold tabular-nums">
                  {s.average.toFixed(1)}
                </span>
                <div className="pb-1.5">
                  <Rating value={s.average} size={16} />
                  <p className="text-muted-foreground text-xs">
                    {t("reviews.basedOn", { count: number(s.total) })}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-1.5">
                {[5, 4, 3, 2, 1].map((r) => {
                  const n = s.distribution[String(r)] ?? 0;
                  const pct = s.total ? Math.round((n / s.total) * 100) : 0;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRating(rating === r ? undefined : r);
                        setPage(1);
                      }}
                      className={cn(
                        "hover:bg-muted flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-xs transition-colors",
                        rating === r && "bg-muted font-semibold",
                      )}
                    >
                      <span className="w-6 tabular-nums">{r}★</span>
                      <span className="bg-border h-2 flex-1 overflow-hidden rounded-full">
                        <span
                          className="block h-full rounded-full bg-amber-400 transition-[width] duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="text-muted-foreground w-8 text-end tabular-nums">{number(n)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground mt-4 text-sm">{t("reviews.noReviews")}</p>
          )}
          <div className="mt-6">
            {isAuthenticated ? (
              <Button variant="outline" onClick={() => setOpen(true)} className="w-full">
                <MessageSquareQuote />
                {t("reviews.write")}
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/login?next=${encodeURIComponent(`/products/${productSlug}#reviews`)}`}>
                  {t("reviews.signInToReview")}
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className={cn("min-w-0 transition-opacity", list.isPlaceholderData && "opacity-60")}>
          {list.data?.results.length ? (
            <ul className="divide-border divide-y">
              {list.data.results.map((r) => (
                <li key={r.id} className="py-6 first:pt-0" data-reveal>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Rating value={r.rating} size={14} />
                      {r.title ? <p className="mt-1.5 font-semibold">{r.title}</p> : null}
                    </div>
                    <span className="text-muted-foreground shrink-0 text-xs">{date(r.created_at)}</span>
                  </div>
                  {r.body ? (
                    <p className="text-foreground/85 mt-2 text-sm leading-relaxed whitespace-pre-line">
                      {r.body}
                    </p>
                  ) : null}
                  {r.image ? (
                    <SmartImage
                      src={r.image}
                      alt=""
                      width={120}
                      height={120}
                      wrapperClassName="mt-3 size-24 rounded-xl"
                    />
                  ) : null}
                  <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="text-foreground font-medium">{r.author.name}</span>
                    {r.is_verified_purchase ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                        <BadgeCheck className="size-3.5" />
                        {t("reviews.verified")}
                      </span>
                    ) : null}
                    {r.size_purchased ? (
                      <span>{t("reviews.sizeBought", { size: r.size_purchased })}</span>
                    ) : null}
                    {r.fit ? (
                      <span>
                        {t(
                          r.fit === "small"
                            ? "reviews.fitSmall"
                            : r.fit === "true"
                              ? "reviews.fitTrue"
                              : "reviews.fitLarge",
                        )}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      disabled={!isAuthenticated || helpful.isPending}
                      onClick={() => helpful.mutate(r.id)}
                      className="hover:bg-muted ms-auto inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors disabled:opacity-60"
                    >
                      <ThumbsUp className="size-3.5" />
                      {t("reviews.helpful", { count: number(r.helpful_count) })}
                    </button>
                  </div>
                  {r.staff_reply ? (
                    <div className="bg-surface mt-3 rounded-2xl p-3.5 text-sm">
                      <p className="text-brand-700 dark:text-brand-400 mb-1 text-xs font-semibold">
                        {t("reviews.reply")}
                      </p>
                      <p className="text-foreground/85">{r.staff_reply}</p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : list.isLoading ? (
            <div className="space-y-6">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : null}
          {list.data ? (
            <Pagination
              className="mt-6"
              page={list.data.page}
              totalPages={list.data.total_pages}
              onChange={setPage}
            />
          ) : null}
        </div>
      </div>
      {isAuthenticated ? (
        <ReviewDialog
          productSlug={productSlug}
          productName={productName}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </section>
  );
}
