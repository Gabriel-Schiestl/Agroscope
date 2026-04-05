import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '@/shared/http/http.config';

interface AuthState {
    name: string;
    email: string;
}

interface AuthContextType {
    auth: AuthState | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    auth: null,
    isAuthenticated: false,
    isLoading: false,
    login: async () => false,
    signup: async () => false,
    logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<AuthState | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            // Mock — descomentar quando backend estiver ativo:
            // await api.post('/auth/login', { email, password });
            setAuth({ name: 'Usuário', email });
            return true;
        } catch {
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (
        name: string,
        email: string,
        password: string,
    ): Promise<boolean> => {
        setIsLoading(true);
        try {
            // Mock — descomentar quando backend estiver ativo:
            // await api.post('/user', { name, email, password });
            setAuth({ name, email });
            return true;
        } catch {
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setAuth(null);
    };

    return (
        <AuthContext.Provider
            value={{
                auth,
                isAuthenticated: !!auth,
                isLoading,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
