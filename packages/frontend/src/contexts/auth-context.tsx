"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import api from "../../shared/http/http.config";
import { useRouter } from "next/navigation";
import Validate from "../../api/login/Validate";
import LogoutAPI from "../../api/login/Logout";

interface AuthState {
  isEngineer: boolean;
  isAdmin: boolean;
  name: string;
  email: string;
  planId?: string;
}

interface AuthContextType {
  auth: AuthState | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => void;
}

const initialAuthState: AuthState = {
  isEngineer: false,
  isAdmin: false,
  name: "",
  email: "",
};

const AuthContext = createContext<AuthContextType>({
  auth: null,
  isLoading: true,
  isAuthenticated: false,
  isLoggingOut: false,
  refreshAuth: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const validateAuth = useCallback(async () => {
    try {
      const response = await Validate();

      if (response && typeof response === "object") {
        setAuth({
          isEngineer: response.isEngineer,
          isAdmin: response.isAdmin || false,
          name: response.name,
          email: response.email,
          planId: response.planId,
        });
        setIsLoggingOut(false);
      } else {
        setAuth(null);
      }
    } catch (error) {
      console.error("Erro ao validar autenticação:", error);
      setAuth(null);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    validateAuth();
  }, [validateAuth]);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await LogoutAPI();
    } finally {
      setAuth(null);
      router.push("/");
    }
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    await validateAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        isLoading,
        isAuthenticated: !!auth,
        isLoggingOut,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
