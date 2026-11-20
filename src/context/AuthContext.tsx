"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { AdminUser, LoginResponse } from "@/lib/types";

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<LoginResponse>;
  mfaVerify: (mfaToken: string, code: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function initAuth() {
      const stored = api.getStoredUser();
      if (stored) {
        setUser(stored);
        try {
          const fresh = await api.getCurrentUser();
          setUser(fresh);
        } catch (err: any) {
          // If 401 or token expired, clear tokens and force re-login
          if (err?.status === 401 || err?.message?.includes("expired") || err?.message?.includes("invalid")) {
            api.clearTokens();
            setUser(null);
          }
        }
      }
      setLoading(false);
    }
    initAuth();

    // Listen for auth expiration events from ApiClient
    const handleAuthExpired = () => {
      setUser(null);
      if (pathname !== "/login") {
        router.push("/login");
      }
    };

    window.addEventListener("henu:auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("henu:auth-expired", handleAuthExpired);
    };
  }, [pathname, router]);

  // Route protection
  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/login") {
        router.push("/login");
      } else if (user && pathname === "/login") {
        router.push("/");
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, pass: string): Promise<LoginResponse> => {
    const res = await api.login(email, pass);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const mfaVerify = async (
    mfaToken: string,
    code: string,
  ): Promise<LoginResponse> => {
    const res = await api.mfaVerify(mfaToken, code);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    const roleName = typeof user.role === "string" ? user.role : user.role?.name;
    if (roleName === "SUPER_ADMIN") return true;
    return Boolean(roleName && roles.includes(roleName as any));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, mfaVerify, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
