"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/lib/types";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
  }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  quickDemoLogin: (role: UserRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("vrs_token");
      const storedUser = localStorage.getItem("vrs_user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to restore auth state", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.auth.signin({ email, password });
      if (res.success && res.data) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem("vrs_token", token);
        localStorage.setItem("vrs_user", JSON.stringify(user));
        return { success: true, message: res.message || "Logged in successfully" };
      }
      return { success: false, message: res.message || "Invalid credentials" };
    } catch (err: any) {
      return { success: false, message: err.message || "Failed to sign in" };
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
  }) => {
    try {
      const res = await api.auth.signup(data);
      if (res.success) {
        // Automatically attempt login after signup
        const loginRes = await login(data.email, data.password);
        if (loginRes.success) {
          return { success: true, message: "Account created and logged in!" };
        }
        return { success: true, message: "Account created! Please sign in." };
      }
      return { success: false, message: res.message || "Signup failed" };
    } catch (err: any) {
      return { success: false, message: err.message || "Signup failed" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("vrs_token");
    localStorage.removeItem("vrs_user");
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem("vrs_user", JSON.stringify(updated));
  };

  // Quick 1-click login for test/review convenience
  const quickDemoLogin = async (targetRole: UserRole): Promise<boolean> => {
    const demoEmail = targetRole === "admin" ? "admin@demo.com" : "customer@demo.com";
    const demoPassword = "demopassword123";

    // Attempt signin
    const res = await login(demoEmail, demoPassword);
    if (res.success) return true;

    // If account doesn't exist, create it
    const signupRes = await signup({
      name: targetRole === "admin" ? "Fleet Admin" : "Alex Customer",
      email: demoEmail,
      password: demoPassword,
      phone: targetRole === "admin" ? "01700000001" : "01700000002",
      role: targetRole,
    });

    return signupRes.success;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        quickDemoLogin,
      }}
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
