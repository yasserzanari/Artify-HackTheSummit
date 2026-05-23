"use client";

/**
 * useAuth.ts — Hook exposing auth state and actions.
 *
 * Uses authStore for state and lib/api.ts for server calls.
 * Never touches cookies or JWT directly — that's the server's job.
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { apiLogin, apiRegister, apiLogout, apiGetMe } from "@/lib/api";
import type { Role } from "@/lib/types";

export function useAuth() {
  const router = useRouter();
  const { user, isGuest, pendingAction, setUser, setGuest, clearAuth } =
    useAuthStore();

  /** Call once on app mount to restore session from the httpOnly cookie. */
  const hydrate = useCallback(async () => {
    const me = await apiGetMe();
    if (me) setUser(me);
  }, [setUser]);

  /** Log in with email + password. Redirects to /discover on success. */
  async function login(email: string, password: string) {
    const { user } = await apiLogin(email, password);
    setUser(user);
    router.push("/discover");
    return user;
  }

  /** Register a new account. Redirects to /discover on success. */
  async function register(
    name: string,
    email: string,
    password: string,
    role: Role
  ) {
    const { user } = await apiRegister(name, email, password, role);
    setUser(user);
    router.push("/discover");
    return user;
  }

  /** Log out, clear store, go back to onboarding. */
  async function logout() {
    await apiLogout();
    clearAuth();
    router.push("/onboarding");
  }

  return {
    user,
    isGuest,
    isLoggedIn: !!user,
    isArtist: user?.role === "artist",
    pendingAction,
    hydrate,
    login,
    register,
    logout,
    setGuest,
  };
}
