// Zustand store for auth — initialised client-side to avoid SSR/localStorage mismatch
// TODO: implement with zustand + persist middleware
import type { User } from "@/lib/types";

export interface AuthStore {
  user: User | null;
  isGuest: boolean;
  pendingAction: string | null;
  login: (user: User) => void;
  logout: () => void;
  setGuest: () => void;
  setPendingAction: (action: string | null) => void;
}
