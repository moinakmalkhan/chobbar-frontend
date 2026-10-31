"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2 } from "lucide-react";

import { PageTitle } from "@/components/account/account-shell";
import { Rating } from "@/components/shared/rating";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { notify } from "@/lib/toast";
import { reviewsService } from "@/services/reviews";

export default function MyReviewsPage() {
  const { t, date } = useI18n();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["reviews", "mine"],
    queryFn: () => reviewsService.list({ mine: 1 }),
  });
  const remove = useMutation({
    mutationFn: reviewsService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      notify.success(t("reviews.deleted"));
    },
    onError: (e) => notify.error(e),
  });
  return (
    <>
      <PageTitle title={t("account.reviews")} />
      {isLoading ? (
        <Skeleton className="h-40 rounded-3xl" />
      ) : data?.results.length ? (
        <ul className="space-y-3">
          {data.results.map((r) => (
            <li key={r.id} className="border-border bg-card rounded-3xl border p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/products/${r.product_slug}`} className="hover:text-brand-700 font-semibold">
                  {r.product_name}
                </Link>
                <StatusBadge
                  status={r.status === "approved" ? "delivered" : r.status}
                  label={t(`reviews.status.${r.status}`)}
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Rating value={r.rating} />
                <span className="text-muted-foreground text-xs">{date(r.created_at)}</span>
              </div>
              {r.title ? <p className="mt-2 font-medium">{r.title}</p> : null}
              {r.body ? <p className="text-muted-foreground mt-1 text-sm">{r.body}</p> : null}
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-red-600"
                onClick={() => remove.mutate(r.id)}
                loading={remove.isPending && remove.variables === r.id}
              >
                <Trash2 />
                {t("common.delete")}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Star} title={t("account.noReviewsMine")} />
      )}
    </>
  );
}
