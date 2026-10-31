import { api } from "@/lib/api";
import type { Address, AuthResponse, Company, CompanyMember, Invitation, Paginated, Role } from "@/types/api";

export const accountsService = {
  company: () => api.get<Company>("/accounts/company/").then((r) => r.data),
  createCompany: (payload: Partial<Company>) => api.post<Company>("/accounts/company/", payload).then((r) => r.data),
  updateCompany: (payload: Partial<Company>) => api.patch<Company>("/accounts/company/", payload).then((r) => r.data),
  switchCompany: (company_id: string) => api.post<AuthResponse>("/accounts/company/switch/", { company_id }).then((r) => r.data),
  members: (page = 1) => api.get<Paginated<CompanyMember>>("/accounts/company/members/", { params: { page } }).then((r) => r.data),
  updateMember: (id: number, payload: Partial<Pick<CompanyMember, "role" | "order_limit" | "is_active">>) => api.patch<CompanyMember>(`/accounts/company/members/${id}/`, payload).then((r) => r.data),
  removeMember: (id: number) => api.delete(`/accounts/company/members/${id}/`),
  invite: (email: string, role: Role) => api.post<Invitation>("/accounts/company/members/invite/", { email, role }).then((r) => r.data),
  invitations: (page = 1) => api.get<Paginated<Invitation>>("/accounts/company/members/invitations/", { params: { page } }).then((r) => r.data),
  revokeInvitation: (id: string) => api.post(`/accounts/company/members/invitations/${id}/revoke/`),
  invitation: (token: string) => api.get<Invitation>(`/accounts/invitations/${token}/`).then((r) => r.data),
  acceptInvitation: (token: string) => api.post<AuthResponse>(`/accounts/invitations/${token}/`).then((r) => r.data),
  addresses: () => api.get<Address[]>("/accounts/company/addresses/").then((r) => r.data),
  createAddress: (payload: Omit<Address, "id" | "created_at">) => api.post<Address>("/accounts/company/addresses/", payload).then((r) => r.data),
  updateAddress: (id: string, payload: Partial<Address>) => api.patch<Address>(`/accounts/company/addresses/${id}/`, payload).then((r) => r.data),
  deleteAddress: (id: string) => api.delete(`/accounts/company/addresses/${id}/`),
};
