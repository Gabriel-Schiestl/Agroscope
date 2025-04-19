"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import api from "../../shared/http/http.config";
import { useRouter } from "next/navigation";

interface AuthState {
  isEngineer: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  auth: AuthState | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => void;
  fetchUserProfile: () => Promise<any>;
}

const initialAuthState: AuthState = {
  isEngineer: false,
  isAdmin: false,
};

const AuthContext = createContext<AuthContextType>({
  auth: null,
  isLoading: true,
  isAuthenticated: false,
  refreshAuth: async () => {},
  logout: () => {},
  fetchUserProfile: async () => ({}),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const validateAuth = async () => {
    try {
      const response = await api.get("/auth/validate");
      setAuth({
        isEngineer: response.data.isEngineer,
        isAdmin: response.data.isAdmin,
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao validar autenticação:", error);
      setAuth(null);
      setIsLoading(false);

      if (
        window.location.pathname !== "/" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/signin")
      ) {
        router.push("/login");
      }
    }
  };

  useEffect(() => {
    validateAuth();
  }, [router]);

  const logout = async () => {
    try {
      document.cookie =
        "agroscope-authentication=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      setAuth(null);
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/users/profile");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      return null;
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
        logout,
        refreshAuth,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
