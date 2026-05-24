"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  getStoredUser,
  register as mockRegister,
  login as mockLogin,
  logout as mockLogout,
} from "@/lib/mockAuth";
import type { Role } from "@/lib/types";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const authModalOpen = useAuthStore((s) => s.authModalOpen);
  const pendingAction = useAuthStore((s) => s.pendingAction);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const setGuest = useAuthStore((s) => s.setGuest);
  const setPendingAction = useAuthStore((s) => s.setPendingAction);
  const setAuthModalOpen = useAuthStore((s) => s.setAuthModalOpen);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = getStoredUser();
    if (stored && !useAuthStore.getState().user) {
      login(stored);
    }
  }, [login]);

  const loginUser = (email: string): boolean => {
    const u = mockLogin(email);
    if (u) {
      login(u);
      return true;
    }
    return false;
  };

  const setShowQuiz = useAuthStore((s) => s.setShowQuiz);
  const setUserProfile = useAuthStore((s) => s.setUserProfile);

  const registerUser = (name: string, email: string, role: Role) => {
    const u = mockRegister(name, email, role);
    login(u);
    setShowQuiz(true);
    return u;
  };

  const logoutUser = () => {
    mockLogout();
    logout();
  };

  const browseAsGuest = () => {
    setGuest(true);
  };

  return {
    user,
    isGuest,
    isLoggedIn: !!user,
    authModalOpen,
    pendingAction,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    browseAsGuest,
    setPendingAction,
    setAuthModalOpen,
    setShowQuiz,
    setUserProfile,
  };
}
