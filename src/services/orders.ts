import { api } from "@/lib/api";
import type {
  BankAccount,
  CheckoutInput,
  Order,
  OrdersSummary,
  OrderSummary,
  Paginated,
  Payment,
  PaymentMethod,
  PaymentMethodOption,
  ReturnRequest,
  ShippingQuote,
  TrackingInfo,
} from "@/types/api";

export const ordersService = {
  shippingQuote: (city: string, province: string, payment_method: PaymentMethod) =>
    api
      .post<ShippingQuote>("/orders/shipping-quote/", { city, province, payment_method })
      .then((r) => r.data),
  checkout: (data: CheckoutInput) => api.post<Order>("/orders/checkout/", data).then((r) => r.data),
  list: (params: { page?: number; status?: string; open?: boolean; q?: string }) =>
    api.get<Paginated<OrderSummary>>("/orders/", { params }).then((r) => r.data),
  get: (id: string) => api.get<Order>(`/orders/${id}/`).then((r) => r.data),
  summary: () => api.get<OrdersSummary>("/orders/summary/").then((r) => r.data),
  cancel: (id: string, reason = "") =>
    api.post<Order>(`/orders/${id}/cancel/`, { reason }).then((r) => r.data),
  reorder: (id: string) =>
    api.post<{ added: number; detail: string }>(`/orders/${id}/reorder/`).then((r) => r.data),
  requestReturn: (id: string, data: FormData) =>
    api.post<ReturnRequest>(`/orders/${id}/returns/`, data).then((r) => r.data),
  returns: () => api.get<Paginated<ReturnRequest>>("/orders/returns/").then((r) => r.data),
  track: (number: string, contact: string) =>
    api.get<TrackingInfo>("/orders/track/", { params: { number, contact } }).then((r) => r.data),
};

export const paymentsService = {
  methods: () => api.get<PaymentMethodOption[]>("/payments/methods/").then((r) => r.data),
  bankAccounts: () => api.get<BankAccount[]>("/payments/bank-accounts/").then((r) => r.data),
  forOrder: (orderId: string, email?: string) =>
    api
      .get<Payment[]>(`/payments/orders/${orderId}/`, { params: email ? { email } : {} })
      .then((r) => r.data),
  submitProof: (orderId: string, data: FormData) =>
    api.post<Payment>(`/payments/orders/${orderId}/`, data).then((r) => r.data),
};
