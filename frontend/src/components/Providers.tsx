"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { apiGetMe, setAccessToken } from "@/lib/api";

/**
 * Attempts a silent refresh on mount. If successful,
 * the access token is restored in memory and the user profile is loaded.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const { login, logout, user } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // If we already have user in persisted store, try refreshing the token silently
    if (user) {
      fetch("/api-proxy/auth/refresh", { method: "POST", credentials: "include" })
        .catch(() => null);

      // Try to get fresh access token via refresh endpoint on backend
      const tryRefresh = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });
          if (res.ok) {
            const data = (await res.json()) as { accessToken: string };
            setAccessToken(data.accessToken);
            // Re-fetch user to validate
            const meData = await apiGetMe();
            login(meData.user, data.accessToken);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      };
      tryRefresh();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
