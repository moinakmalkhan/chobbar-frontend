import { api } from "@/lib/api";
import type { Order, Paginated, PaymentMethod, Quote, QuoteSummary } from "@/types/api";

export const quotesService = {
  list: (params: { page?: number; status?: string }) => api.get<Paginated<QuoteSummary>>("/quotes/", { params }).then((r) => r.data),
  get: (id: string) => api.get<Quote>(`/quotes/${id}/`).then((r) => r.data),
  request: (payload: { customer_notes?: string; target_budget?: number | null; delivery_deadline?: string | null; shipping_address?: string | null }) =>
    api.post<Quote>("/quotes/", payload).then((r) => r.data),
  accept: (id: string, payload: { shipping_address: string; payment_method: PaymentMethod; po_number?: string }) => api.post<Order>(`/quotes/${id}/accept/`, payload).then((r) => r.data),
  decline: (id: string, reason = "") => api.post<Quote>(`/quotes/${id}/decline/`, { reason }).then((r) => r.data),
};
