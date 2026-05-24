"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

type PendingAction = { type: "like" | "save"; artworkId: string };

interface AuthStore {
  user: User | null;
  isGuest: boolean;
  quizDone: boolean;
  pendingAction: PendingAction | null;
  authModalOpen: boolean;
  authModalTab: "login" | "register";
  sessionChecked: boolean;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setGuest: (val: boolean) => void;
  setQuizDone: () => void;
  setPendingAction: (action: PendingAction | null) => void;
  setAuthModalOpen: (open: boolean) => void;
  setAuthModalTab: (tab: "login" | "register") => void;
  openAuthModal: (tab: "login" | "register") => void;
  setSessionChecked: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isGuest: false,
      quizDone: false,
      pendingAction: null,
      authModalOpen: false,
      authModalTab: "login",
      sessionChecked: false, // true once the JWT cookie has been validated on mount
      setUser: (user) => set({ user, isGuest: false, pendingAction: null, authModalOpen: false }),
      clearAuth: () => set({ user: null, isGuest: false, pendingAction: null }),
      setGuest: (val) => set({ isGuest: val }),
      setQuizDone: () => set({ quizDone: true }),
      setPendingAction: (action) => set({ pendingAction: action }),
      setAuthModalOpen: (open) => set({ authModalOpen: open }),
      setAuthModalTab: (tab) => set({ authModalTab: tab }),
      openAuthModal: (tab) => set({ authModalOpen: true, authModalTab: tab }),
      setSessionChecked: () => set({ sessionChecked: true }),
    }),
    {
      name: "artify-auth",
      // Only persist identity + quiz flag — UI state (modals, pending actions) is never saved
      partialize: (s) => ({ user: s.user, isGuest: s.isGuest, quizDone: s.quizDone }),
    }
  )
);

export function useAuth() {
  const router = useRouter();
  const { user, isGuest, quizDone, pendingAction, authModalOpen, authModalTab, sessionChecked,
    setUser, clearAuth, setGuest, setQuizDone, setPendingAction, setAuthModalOpen, openAuthModal, setSessionChecked,
  } = useAuthStore();

  // On mount: re-validate the JWT cookie so stale localStorage data doesn't linger
  useEffect(() => {
    if (sessionChecked) return;
    setSessionChecked();
    if (!user) return;
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => { if (data?.user) setUser(data.user); else clearAuth(); })
      .catch(() => clearAuth());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Login failed");
    setUser(data.user);
    router.push("/discover");
  }

  async function register(name: string, email: string, password: string, role: "viewer" | "artist") {
    const res = await fetch("/api/auth/register", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Registration failed");
    setUser(data.user);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    clearAuth();
    router.push("/onboarding");
  }

  return {
    user, isGuest, quizDone, sessionChecked, pendingAction, authModalOpen, authModalTab,
    isLoggedIn: !!user,
    isArtist: user?.role === "artist",
    login, register, logout,
    browseAsGuest: () => setGuest(true),
    setGuest, setQuizDone, setPendingAction, setAuthModalOpen, openAuthModal,
  };
}
