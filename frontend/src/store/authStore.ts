"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/types";
import { setAccessToken } from "@/lib/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: (user, token) => {
        setAccessToken(token);
        set({ user, accessToken: token, isAuthenticated: true });
      },

      logout: () => {
        setAccessToken(null);
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setToken: (token) => {
        setAccessToken(token);
        set({ accessToken: token, isAuthenticated: true });
      },
    }),
    {
      name: "lms-auth",
      // Only persist user, not the token (re-retrieved via refresh on load)
      partialize: (state) => ({ user: state.user }),
    }
  )
);
