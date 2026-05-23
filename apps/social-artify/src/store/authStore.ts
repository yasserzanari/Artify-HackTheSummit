"use client";

/**
 * authStore.ts — Client-side auth state via Zustand.
 *
 * The JWT token lives in an httpOnly cookie managed by the server.
 * This store only holds the User object and UI flags — never the raw token.
 */

import { create } from "zustand";
import type { User } from "@/lib/types";

interface PendingAction {
  type: "like" | "save";
  artworkId: string;
}

interface AuthStore {
  user: User | null;
  isGuest: boolean;
  pendingAction: PendingAction | null;

  setUser: (user: User) => void;
  setGuest: () => void;
  clearAuth: () => void;
  setPendingAction: (action: PendingAction | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isGuest: false,
  pendingAction: null,

  setUser: (user) => set({ user, isGuest: false, pendingAction: null }),
  setGuest: () => set({ user: null, isGuest: true }),
  clearAuth: () => set({ user: null, isGuest: false, pendingAction: null }),
  setPendingAction: (action) => set({ pendingAction: action }),
}));
