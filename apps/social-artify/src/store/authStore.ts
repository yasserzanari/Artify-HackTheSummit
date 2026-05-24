"use client";
import { create } from "zustand";
import type { User, ArtProfile } from "@/lib/types";

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
  showQuiz: boolean;
  login: (user: User) => void;
  logout: () => void;
  setGuest: (val: boolean) => void;
  setPendingAction: (action: PendingAction | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  setAuthModalTab: (tab: "login" | "register") => void;
  openAuthModal: (tab: "login" | "register") => void;
  setShowQuiz: (val: boolean) => void;
  setUserProfile: (profile: ArtProfile) => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isGuest: false,
  pendingAction: null,
  authModalOpen: false,
  authModalTab: "login",
  showQuiz: false,
  login: (user) =>
    set({ user, isGuest: false, pendingAction: null, authModalOpen: false }),
  logout: () => set({ user: null, isGuest: false }),
  setGuest: (val) => set({ isGuest: val }),
  setPendingAction: (action) => set({ pendingAction: action }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
  openAuthModal: (tab) => set({ authModalOpen: true, authModalTab: tab }),
  setShowQuiz: (val) => set({ showQuiz: val }),
  setUserProfile: (profile) =>
    set((s) => ({ user: s.user ? { ...s.user, artProfile: profile } : null })),
}));
