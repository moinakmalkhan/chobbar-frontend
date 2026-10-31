import { api } from "@/lib/api";
import type { Address, AddressInput } from "@/types/api";

export const accountsService = {
  addresses: () => api.get<Address[]>("/accounts/addresses/").then((r) => r.data),
  createAddress: (data: AddressInput) => api.post<Address>("/accounts/addresses/", data).then((r) => r.data),
  updateAddress: (id: string, data: Partial<AddressInput>) =>
    api.patch<Address>(`/accounts/addresses/${id}/`, data).then((r) => r.data),
  deleteAddress: (id: string) => api.delete(`/accounts/addresses/${id}/`),
  provinces: () => api.get<string[]>("/accounts/provinces/").then((r) => r.data),
  subscribe: (email: string, source = "footer") =>
    api.post<{ detail: string }>("/accounts/newsletter/", { email, source }).then((r) => r.data),
};
