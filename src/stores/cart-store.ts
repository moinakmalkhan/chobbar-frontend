"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { uid } from "@/lib/utils";

/** Client-side identifiers only; cart contents live on the server (React Query). */
interface CartState {
  guestToken: string | null;
  sessionKey: string;
  drawerOpen: boolean;
  setGuestToken: (token: string | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      guestToken: null,
      sessionKey: uid(),
      drawerOpen: false,
      setGuestToken: (guestToken) => set({ guestToken }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: "leepa.cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ guestToken: s.guestToken, sessionKey: s.sessionKey }),
    },
  ),
);
