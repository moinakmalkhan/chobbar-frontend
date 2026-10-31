"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { authService } from "@/services/auth";
import { accountsService } from "@/services/accounts";
import { canManage, canOrder, selectMembership, useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import type { AuthResponse } from "@/types/api";

export function useAuth() {
  const store = useAuthStore();
  const membership = useAuthStore(selectMembership);
  const queryClient = useQueryClient();
  const router = useRouter();

  const isAuthenticated = Boolean(store.access && store.user);

  const completeLogin = useCallback(
    (data: AuthResponse, redirect?: string | null) => {
      store.setSession(data);
      useCartStore.getState().setGuestToken(null);
      queryClient.invalidateQueries();
      notify.success(`Welcome back, ${data.user.first_name || data.user.email}!`, data.user.memberships[0] ? `Signed in to ${data.user.memberships[0].company.name}.` : undefined);
      router.push(redirect || "/account");
    },
    [store, queryClient, router],
  );

  const logout = useCallback(async () => {
    const refresh = store.refresh;
    store.clear();
    queryClient.clear();
    if (refresh) authService.logout(refresh).catch(() => undefined);
    notify.info("Signed out", "See you next season.");
    router.push("/");
  }, [store, queryClient, router]);

  const switchCompany = useMutation({
    mutationFn: (companyId: string) => accountsService.switchCompany(companyId),
    onSuccess: (data) => {
      store.setSession(data);
      queryClient.invalidateQueries();
      notify.success(`Switched to ${data.user.memberships.find((m) => m.is_default)?.company.name ?? "company"}`);
    },
    onError: (e) => notify.error(e, "Could not switch company"),
  });

  return {
    ...store,
    isAuthenticated,
    membership,
    company: membership?.company ?? null,
    role: membership?.role ?? null,
    canOrder: canOrder(membership),
    canManage: canManage(membership),
    completeLogin,
    logout,
    switchCompany,
  };
}

/** Keeps the cached user profile fresh after hydration. */
export function useMeQuery() {
  const { isAuthenticated, hydrated, setUser } = useAuth();
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const user = await authService.me();
      setUser(user);
      return user;
    },
    enabled: hydrated && isAuthenticated,
    staleTime: 5 * 60_000,
  });
}
