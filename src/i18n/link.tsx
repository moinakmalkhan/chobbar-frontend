"use client";

import NextLink from "next/link";
import { useRouter as useNextRouter } from "next/navigation";
import { forwardRef, useMemo } from "react";

import { useI18n } from "./client";

type Props = Omit<React.ComponentProps<typeof NextLink>, "href"> & { href: string };

/** Locale-aware <Link>: pass app paths ("/cart"), get "/ur/cart". */
export const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, ...props }, ref) {
  const { href: localize } = useI18n();
  return <NextLink ref={ref} href={localize(href)} {...props} />;
});

/** Locale-aware router.push/replace. */
export function useRouter() {
  const router = useNextRouter();
  const { href } = useI18n();
  return useMemo(
    () => ({
      ...router,
      push: (path: string, opts?: Parameters<typeof router.push>[1]) => router.push(href(path), opts),
      replace: (path: string, opts?: Parameters<typeof router.replace>[1]) =>
        router.replace(href(path), opts),
    }),
    [router, href],
  );
}

/** Strip the locale prefix from a pathname: "/ur/cart" → "/cart". */
export function stripLocale(pathname: string) {
  return pathname.replace(/^\/(en|ur|ar)(?=\/|$)/, "") || "/";
}
