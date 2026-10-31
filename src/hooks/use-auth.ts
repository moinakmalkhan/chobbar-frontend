"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useI18n } from "@/i18n/client";
import { useRouter } from "@/i18n/link";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { authService } from "@/services/auth";
import { cartService } from "@/services/cart";
import { useAuthStore } from "@/stores/auth-store";
import { useLocalStore } from "@/stores/local-store";
import type { AuthResponse, User } from "@/types/api";

export function useAuth() {
  const access = useAuthStore((s) => s.access);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  return { access, user, hydrated, isAuthenticated: Boolean(access && user) };
}

/** Keeps the cached profile fresh (and the store in sync) while signed in. */
export function useMe() {
  const { isAuthenticated, hydrated } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const me = await authService.me();
      setUser(me);
      return me;
    },
    enabled: hydrated && isAuthenticated,
    staleTime: 5 * 60_000,
  });
}

/** After any sign-in: store the session, push the guest wishlist up, and refetch the merged bag. */
function useCompleteSignIn() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  const { t } = useI18n();
  return useCallback(
    async (data: AuthResponse, opts: { welcome?: boolean } = {}) => {
      setSession(data);
      queryClient.setQueryData(queryKeys.me, data.user);
      const local = useLocalStore.getState();
      if (local.wishlist.length) {
        try {
          const server = await cartService.wishlist();
          const have = new Set(server.results.map((r) => r.product.slug));
          await Promise.allSettled(
            local.wishlist.filter((s) => !have.has(s)).map((slug) => cartService.toggleWishlist(slug)),
          );
          local.setWishlist([]);
        } catch {
          /* wishlist sync is best effort */
        }
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wishlist }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);
      if (opts.welcome !== false)
        notify.success(t("auth.welcome", { name: data.user.first_name || data.user.email.split("@")[0] }));
    },
    [queryClient, setSession, t],
  );
}

export function useLogin() {
  const complete = useCompleteSignIn();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => complete(data),
  });
}

export function useGoogleLogin() {
  const complete = useCompleteSignIn();
  return useMutation({ mutationFn: authService.google, onSuccess: (data) => complete(data) });
}

export function useRegister() {
  const complete = useCompleteSignIn();
  return useMutation({ mutationFn: authService.register, onSuccess: (data) => complete(data) });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useI18n();
  return useCallback(
    async (opts: { silent?: boolean; redirect?: string } = {}) => {
      const { refresh, clear } = useAuthStore.getState();
      if (refresh) authService.logout(refresh).catch(() => undefined);
      clear();
      queryClient.removeQueries({
        predicate: (q) =>
          !["storefront", "categories", "products", "product", "feed", "collections"].includes(
            String(q.queryKey[0]),
          ),
      });
      if (!opts.silent) notify.info(t("auth.signedOut"));
      router.replace(opts.redirect ?? "/");
    },
    [queryClient, router, t],
  );
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const { t } = useI18n();
  return useMutation({
    mutationFn: (patch: Partial<User>) => authService.updateMe(patch),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(queryKeys.me, user);
      notify.success(t("account.profileSaved"));
    },
  });
}
