"use client";

import { useState, useEffect, useCallback } from "react";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface UseUserReturn {
  user: CurrentUser | null;
  isLoading: boolean;
  refetch: () => void;
  logout: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  }, []);

  return { user, isLoading, refetch: fetchUser, logout };
}