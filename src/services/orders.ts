import { api } from "@/lib/api";
import type { BankAccount, Invoice, Order, OrderSummary, OrdersSummary, Paginated, Payment, PaymentMethod, ShippingMethod, TrackingInfo } from "@/types/api";

export interface CheckoutPayload {
  shipping_address: string;
  billing_address?: string | null;
  shipping_method: string;
  payment_method: PaymentMethod;
  po_number?: string;
  customer_notes?: string;
  requested_delivery_date?: string | null;
}

export interface OrderListParams {
  page?: number;
  page_size?: number;
  status?: string[];
  q?: string;
  open?: boolean;
  ordering?: string;
}

export const ordersService = {
  shippingMethods: () => api.get<ShippingMethod[]>("/orders/shipping-methods/").then((r) => r.data),
  checkout: (payload: CheckoutPayload) => api.post<Order>("/orders/checkout/", payload).then((r) => r.data),
  list: (params: OrderListParams) => api.get<Paginated<OrderSummary>>("/orders/", { params, paramsSerializer: { indexes: null } }).then((r) => r.data),
  get: (id: string) => api.get<Order>(`/orders/${id}/`).then((r) => r.data),
  invoice: (id: string) => api.get<Invoice>(`/orders/${id}/invoice/`).then((r) => r.data),
  cancel: (id: string, reason: string) => api.post<Order>(`/orders/${id}/cancel/`, { reason }).then((r) => r.data),
  approve: (id: string) => api.post<Order>(`/orders/${id}/approve/`).then((r) => r.data),
  reorder: (id: string) => api.post<{ added: number; detail: string }>(`/orders/${id}/reorder/`).then((r) => r.data),
  summary: () => api.get<OrdersSummary>("/orders/summary/").then((r) => r.data),
  track: (number: string, email: string) => api.get<TrackingInfo>("/orders/track/", { params: { number, email } }).then((r) => r.data),
  payments: (orderId: string) => api.get<Paginated<Payment>>("/payments/", { params: { order: orderId } }).then((r) => r.data),
  bankAccounts: () => api.get<BankAccount[]>("/payments/bank-accounts/").then((r) => r.data),
  submitProof: (paymentId: string, payload: { reference: string; note?: string; proof?: File | null }) => {
    const form = new FormData();
    form.append("reference", payload.reference);
    if (payload.note) form.append("note", payload.note);
    if (payload.proof) form.append("proof", payload.proof);
    return api.post<Payment>(`/payments/${paymentId}/submit-proof/`, form).then((r) => r.data);
  },
};
