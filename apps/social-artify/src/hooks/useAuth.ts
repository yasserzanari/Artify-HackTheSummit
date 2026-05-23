"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/lib/types";

export function useAuth() {
  const router = useRouter();
  const {
    user, isGuest, pendingAction, authModalOpen, authModalTab,
    setUser, clearAuth, setGuest, setPendingAction,
    setAuthModalOpen, openAuthModal,
  } = useAuthStore();

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Login failed");
    setUser(data.user);
    router.push("/discover");
    return data.user;
  }

  async function register(name: string, email: string, password: string, role: Role) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Register failed");
    setUser(data.user);
    router.push("/discover");
    return data.user;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    clearAuth();
    router.push("/onboarding");
  }

  function browseAsGuest() {
    setGuest(true);
  }

  return {
    user,
    isGuest,
    isLoggedIn: !!user,
    isArtist: user?.role === "artist",
    pendingAction,
    authModalOpen,
    authModalTab,
    login,
    register,
    logout,
    browseAsGuest,
    setGuest,
    setPendingAction,
    setAuthModalOpen,
    openAuthModal,
  };
}
