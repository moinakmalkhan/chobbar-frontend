"use client";

import { create } from "zustand";

interface UIState {
  searchOpen: boolean;
  mobileNavOpen: boolean;
  chatOpen: boolean;
  activeConversationId: string | null;
  setSearchOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setChatOpen: (open: boolean, conversationId?: string | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  searchOpen: false,
  mobileNavOpen: false,
  chatOpen: false,
  activeConversationId: null,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setChatOpen: (chatOpen, conversationId) =>
    set((s) => ({
      chatOpen,
      activeConversationId: conversationId === undefined ? s.activeConversationId : conversationId,
    })),
}));
