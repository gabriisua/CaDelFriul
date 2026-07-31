"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  fetchProfile,
  login as apiLogin,
  logout as apiLogout,
  getToken,
  type UserResponse,
} from "@/lib/api";

interface AuthContextValue {
  user: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(() => !!getToken());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    fetchProfile()
      .then((profile) => {
        if (mounted.current) setUser(profile);
      })
      .catch(() => {
        if (mounted.current) setUser(null);
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
  }, [loading]);

  const login = useCallback(async (email: string, password: string) => {
    await apiLogin(email, password);
    const profile = await fetchProfile();
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    localStorage.removeItem("cadelfriul_cart");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
