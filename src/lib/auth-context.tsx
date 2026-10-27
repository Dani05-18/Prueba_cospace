"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Role } from "@/lib/prisma";

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      window.location.href = "/";
    }
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

