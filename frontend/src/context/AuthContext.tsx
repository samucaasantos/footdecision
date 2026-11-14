"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthResponseDTO, LoginRequestDTO, UserRole } from "@/types/api";
import { api, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "@/services/api";

export interface AuthenticatedUser {
  username: string;
  role: UserRole;
  displayName: string;
  expiresAt?: number;
}

interface AuthContextValue {
  user: AuthenticatedUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDirector: boolean;
  isAnalyst: boolean;
  login: (credentials: LoginRequestDTO) => Promise<AuthResponseDTO>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function formatUserDisplayName(username: string): string {
  if (username === "lucca_martinelli") return "Lucas Martinelli";
  if (username === "rodrigo_faria") return "Rodrigo Faria";
  return username
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      // Remove any old persistent tokens from localStorage so opening the app fresh always requires login
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);

      const savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      const savedUserRaw = sessionStorage.getItem(USER_STORAGE_KEY);
      if (savedToken && savedUserRaw) {
        const parsedUser = JSON.parse(savedUserRaw) as AuthenticatedUser;
        if (parsedUser.expiresAt && Date.now() > parsedUser.expiresAt) {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          sessionStorage.removeItem(USER_STORAGE_KEY);
        } else {
          setToken(savedToken);
          setUser(parsedUser);
        }
      }
    } catch {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const isLoginPage = pathname === "/login";
    if (!token && !isLoginPage) {
      router.replace("/login");
    }
  }, [isLoading, token, pathname, router]);

  const login = useCallback(
    async (credentials: LoginRequestDTO): Promise<AuthResponseDTO> => {
      const response = await api.auth.login(credentials);
      const expiresAt = response.expiresIn
        ? Date.now() + response.expiresIn * 1000
        : Date.now() + 24 * 60 * 60 * 1000;

      const authUser: AuthenticatedUser = {
        username: response.username,
        role: response.role,
        displayName: formatUserDisplayName(response.username),
        expiresAt,
      };

      sessionStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
      setToken(response.token);
      setUser(authUser);
      router.push("/dashboard");
      return response;
    },
    [router]
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      isDirector: user?.role === "ROLE_DIRECTOR",
      isAnalyst: user?.role === "ROLE_ANALYST",
      login,
      logout,
    }),
    [user, token, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return ctx;
}
