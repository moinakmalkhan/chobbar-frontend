import { api } from "@/lib/api";
import type { AuthResponse, User } from "@/types/api";

export const authService = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login/", { email, password }).then((r) => r.data),
  google: (idToken: string) =>
    api.post<AuthResponse>("/auth/login/google/", { id_token: idToken }).then((r) => r.data),
  register: (payload: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
    phone?: string;
    marketing_opt_in?: boolean;
  }) => api.post<AuthResponse>("/auth/register/", payload).then((r) => r.data),
  logout: (refresh: string) => api.post("/auth/logout/", { refresh }),
  verifyEmail: (token: string) =>
    api.post<{ detail: string }>("/auth/verify-email/", { token }).then((r) => r.data),
  resendVerification: () => api.post<{ detail: string }>("/auth/verify-email/resend/").then((r) => r.data),
  requestReset: (email: string) =>
    api.post<{ detail: string }>("/auth/password/reset/", { email }).then((r) => r.data),
  confirmReset: (token: string, password: string) =>
    api.post<{ detail: string }>("/auth/password/reset/confirm/", { token, password }).then((r) => r.data),
  changePassword: (current_password: string, new_password: string) =>
    api
      .post<{ detail: string }>("/auth/password/change/", { current_password, new_password })
      .then((r) => r.data),
  me: () => api.get<User>("/accounts/me/").then((r) => r.data),
  updateMe: (patch: Partial<User>) => api.patch<User>("/accounts/me/", patch).then((r) => r.data),
  deleteMe: () => api.delete("/accounts/me/"),
};
