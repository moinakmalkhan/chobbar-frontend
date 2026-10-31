"use client";

import { Heart } from "lucide-react";

import { ProductGrid } from "@/components/catalog/product-grid";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-cart";
import { useProductsBySlugs } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";

export default function WishlistPage() {
  const { t, number } = useI18n();
  const { isAuthenticated, hydrated } = useAuth();
  const wishlist = useWishlist();
  // Guests: the list lives on this device; fetch cards for those slugs in one call.
  const guest = useProductsBySlugs(isAuthenticated ? [] : wishlist.slugs);
  const products = isAuthenticated
    ? (wishlist.data?.results.map((r) => r.product) ?? [])
    : (guest.data?.results ?? []).filter((p) => wishlist.slugs.includes(p.slug));
  const loading =
    !hydrated || (isAuthenticated ? wishlist.isLoading : guest.isLoading && wishlist.slugs.length > 0);

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: t("nav.home"), href: "/" }, { label: t("nav.wishlist") }]} />
      <h1 className="font-display mb-2 text-3xl font-extrabold">
        {t("nav.wishlist")}{" "}
        {products.length ? (
          <span className="text-muted-foreground text-lg">({number(products.length)})</span>
        ) : null}
      </h1>
      {!isAuthenticated && hydrated && wishlist.slugs.length ? (
        <p className="text-muted-foreground mb-6 text-sm">
          {t("account.wishlistGuest")}{" "}
          <Link
            href="/login?next=/wishlist"
            className="text-foreground font-semibold underline underline-offset-4"
          >
            {t("nav.signIn")}
          </Link>
        </p>
      ) : (
        <div className="mb-6" />
      )}
      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : products.length ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState
          icon={Heart}
          title={t("account.emptyWishlist")}
          description={t("account.emptyWishlistHint")}
          action={
            <Button asChild>
              <Link href="/products">{t("common.shopNow")}</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
