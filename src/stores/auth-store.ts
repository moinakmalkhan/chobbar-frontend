"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { User } from "@/types/api";

interface AuthState {
  access: string | null;
  refresh: string | null;
  user: User | null;
  hydrated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setSession: (payload: { access: string; refresh: string; user: User }) => void;
  setUser: (user: User) => void;
  clear: () => void;
  setHydrated: () => void;
}

/** Tokens + profile persisted in localStorage so the shopper stays signed in across visits. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      access: null,
      refresh: null,
      user: null,
      hydrated: false,
      setTokens: (access, refresh) => set({ access, refresh }),
      setSession: ({ access, refresh, user }) => set({ access, refresh, user }),
      setUser: (user) => set({ user }),
      clear: () => set({ access: null, refresh: null, user: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "chobbar.auth",
      // Rehydrated after mount (see Providers) so server HTML and the first client render match.
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ access: s.access, refresh: s.refresh, user: s.user }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
