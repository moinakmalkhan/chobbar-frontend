"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { ordersService, paymentsService } from "@/services/orders";

export function useOrders(params: { page?: number; status?: string; open?: boolean }) {
  const { isAuthenticated, hydrated } = useAuth();
  return useQuery({
    queryKey: queryKeys.orders(params),
    queryFn: () => ordersService.list(params),
    enabled: hydrated && isAuthenticated,
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string) {
  const { isAuthenticated, hydrated } = useAuth();
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => ordersService.get(id),
    enabled: hydrated && isAuthenticated && !!id,
  });
}

export function useOrdersSummary() {
  const { isAuthenticated, hydrated } = useAuth();
  return useQuery({
    queryKey: queryKeys.ordersSummary,
    queryFn: ordersService.summary,
    enabled: hydrated && isAuthenticated,
    staleTime: 60_000,
  });
}

export function useReturns() {
  const { isAuthenticated, hydrated } = useAuth();
  return useQuery({
    queryKey: queryKeys.returns,
    queryFn: ordersService.returns,
    enabled: hydrated && isAuthenticated,
  });
}

export function useBankAccounts(enabled = true) {
  return useQuery({
    queryKey: queryKeys.bankAccounts,
    queryFn: paymentsService.bankAccounts,
    enabled,
    staleTime: 30 * 60_000,
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: queryKeys.paymentMethods,
    queryFn: paymentsService.methods,
    staleTime: 30 * 60_000,
  });
}

export function useOrderActions(id: string) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.order(id) });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };
  const cancel = useMutation({
    mutationFn: (reason: string) => ordersService.cancel(id, reason),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.order(id), order);
      refresh();
      notify.success(t("account.cancelled"));
    },
    onError: (e) => notify.error(e),
  });
  const reorder = useMutation({
    mutationFn: () => ordersService.reorder(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      if (res.added) notify.success(t("account.reordered"), res.detail);
      else notify.warning(res.detail);
    },
    onError: (e) => notify.error(e),
  });
  const requestReturn = useMutation({
    mutationFn: (data: FormData) => ordersService.requestReturn(id, data),
    onSuccess: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: queryKeys.returns });
      notify.success(t("account.returnDone"));
    },
    onError: (e) => notify.error(e),
  });
  return { cancel, reorder, requestReturn };
}
