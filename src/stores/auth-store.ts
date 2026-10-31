"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Membership, User } from "@/types/api";

interface AuthState {
  access: string | null;
  refresh: string | null;
  user: User | null;
  /** Company acting on behalf of (multi-company users). */
  companyId: string | null;
  hydrated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setSession: (payload: { access: string; refresh: string; user: User }) => void;
  setUser: (user: User) => void;
  setCompany: (companyId: string | null) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      access: null,
      refresh: null,
      user: null,
      companyId: null,
      hydrated: false,
      setTokens: (access, refresh) => set({ access, refresh }),
      setSession: ({ access, refresh, user }) => {
        const current = get().companyId;
        const stillMember = user.memberships.some((m) => m.company.id === current);
        const fallback = user.memberships.find((m) => m.is_default)?.company.id ?? user.memberships[0]?.company.id ?? null;
        set({ access, refresh, user, companyId: stillMember ? current : fallback });
      },
      setUser: (user) => set({ user }),
      setCompany: (companyId) => set({ companyId }),
      clear: () => set({ access: null, refresh: null, user: null, companyId: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "leepa.auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ access: s.access, refresh: s.refresh, user: s.user, companyId: s.companyId }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

export const selectMembership = (s: AuthState): Membership | null =>
  s.user?.memberships.find((m) => m.company.id === s.companyId) ?? s.user?.memberships[0] ?? null;

export const selectIsAuthenticated = (s: AuthState) => Boolean(s.access && s.user);

export const canOrder = (m: Membership | null) => !!m && ["owner", "admin", "buyer"].includes(m.role);
export const canManage = (m: Membership | null) => !!m && ["owner", "admin"].includes(m.role);
