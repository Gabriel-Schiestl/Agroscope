"use client";

import type React from "react";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("agroscope_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      if (email === "demo@example.com" && password === "password") {
        const user = {
          id: "1",
          name: "Dr. Carlos Silva",
          email: "demo@example.com",
          role: "Agrônomo",
        };
        setUser(user);
        try {
          localStorage.setItem("agroscope_user", JSON.stringify(user));
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }
        router.push("/dashboard");
      } else {
        throw new Error("Credenciais inválidas");
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const user = {
        id: "1",
        name: "Dr. Carlos Silva",
        email: "demo@example.com",
        role: "Agrônomo",
        avatar: "https://placehold.co/32x32",
      };
      setUser(user);
      try {
        localStorage.setItem("agroscope_user", JSON.stringify(user));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
      router.push("/dashboard");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const user = {
        id: "1",
        name,
        email,
        role: "Agrônomo",
      };
      setUser(user);
      try {
        localStorage.setItem("agroscope_user", JSON.stringify(user));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
      router.push("/dashboard");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("agroscope_user");
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
