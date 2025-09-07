"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

interface User {
  id: string | number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role_names?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("auth-token");
      if (token) {
        try {
          const response = await apiClient.get("/api/auth/me");
          const { data: { user: userData } } = response.data;
          setUser(userData);
        } catch (error) {
          localStorage.removeItem("auth-token");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log("Login attempt started", { email });
    try {
      const response = await apiClient.post("/api/auth/login", { email, password });
      console.log("API Response:", response);
      console.log("Response data:", response.data);
      
      const { data: { user: userData } } = response.data;
      console.log("User data:", userData);
      
      // For now, create a mock token since backend doesn't return one yet
      const mockToken = `mock_token_${userData.id}_${Date.now()}`;
      localStorage.setItem("auth-token", mockToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  const register = async (data: any) => {
    const response = await apiClient.post("/api/auth/register", data);
    const { data: { user: userData } } = response.data;
    
    // For now, create a mock token since backend doesn't return one yet
    const mockToken = `mock_token_${userData.id}_${Date.now()}`;
    localStorage.setItem("auth-token", mockToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    
    router.push("/dashboard");
  };

  const hasRole = (role: string) => {
    return user?.role_names?.some((r) => r.toLowerCase() === role.toLowerCase()) || false;
  };

  const isAdmin = () => {
    return hasRole("admin") || hasRole("super-admin");
  };

  const isSuperAdmin = () => {
    return hasRole("super-admin");
  };

  const value = {
    user,
    login,
    logout,
    register,
    isLoading,
    hasRole,
    isAdmin,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}