"use client";

import { create } from "zustand";
import type { User } from "@/lib/types";

interface PendingAction {
  type: string;
  artworkId?: string;
}

interface AuthStore {
  user: User | null;
  isGuest: boolean;
  pendingAction: PendingAction | null;
  authModalOpen: boolean;
  authModalTab: "login" | "register";

  setUser: (user: User) => void;
  clearAuth: () => void;
  setGuest: (val: boolean) => void;
  setPendingAction: (action: PendingAction | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  setAuthModalTab: (tab: "login" | "register") => void;
  openAuthModal: (tab: "login" | "register") => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isGuest: false,
  pendingAction: null,
  authModalOpen: false,
  authModalTab: "login",

  setUser: (user) => set({ user, isGuest: false, pendingAction: null, authModalOpen: false }),
  clearAuth: () => set({ user: null, isGuest: false, pendingAction: null }),
  setGuest: (val) => set({ isGuest: val }),
  setPendingAction: (action) => set({ pendingAction: action }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
  openAuthModal: (tab) => set({ authModalOpen: true, authModalTab: tab }),
}));
