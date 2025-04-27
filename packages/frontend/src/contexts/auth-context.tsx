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
import Validate from "../../api/login/Validate";

interface AuthState {
  isEngineer: boolean;
  isAdmin: boolean;
  name: string;
  email: string;
}

interface AuthContextType {
  auth: AuthState | null;
  isLoading: boolean;
  isAuthenticated: boolean;
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
  refreshAuth: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const validateAuth = async () => {
    try {
      const response = await Validate();

      if (response && typeof response === "object") {
        setAuth({
          isEngineer: response.isEngineer,
          isAdmin: response.isAdmin || false,
          name: response.name,
          email: response.email,
        });

        setIsLoading(false);
      }
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
      //TODO: implementar logout no backend
      setAuth(null);
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
