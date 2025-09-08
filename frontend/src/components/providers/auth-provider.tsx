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
    console.log("Login attempt started", { email, password });
    console.log("API Client base URL:", apiClient.defaults.baseURL);
    
    try {
      console.log("Sending request to:", `${apiClient.defaults.baseURL}/api/auth/login`);
      const response = await apiClient.post("/api/auth/login", { email, password });
      console.log("Full API Response:", response);
      console.log("Response data:", response.data);
      console.log("Response status:", response.status);
      
      if (response.data && response.data.success) {
        const userData = response.data.data.user;
        console.log("User data extracted:", userData);
        
        // Store token if provided, otherwise create mock token
        const token = response.data.data.token || `mock_token_${userData.id}_${Date.now()}`;
        localStorage.setItem("auth-token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        
        console.log("Login successful, redirecting to dashboard");
        router.push("/dashboard");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      
      // Create a more specific error message
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      const customError = new Error(errorMessage);
      (customError as any).response = error.response;
      throw customError;
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