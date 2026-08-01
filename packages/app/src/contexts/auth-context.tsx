import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '@/shared/http/http.config';

interface AuthState {
    name: string;
    email: string;
}

interface AuthContextType {
    auth: AuthState | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (
        name: string,
        email: string,
        password: string,
        acceptedTerms: boolean,
    ) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    auth: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    login: async () => false,
    signup: async () => false,
    logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<AuthState | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            console.log(
                'Attempting login with email:',
                email,
                api.defaults.baseURL,
            );
            const response = await api.post<{ token: string; name?: string }>(
                '/auth/login',
                { email, password },
            );
            const { token: authToken, name } = response.data;
            setToken(authToken);
            api.defaults.headers.common['authorization'] = authToken;
            setAuth({ name: name ?? 'Usuário', email });
            return true;
        } catch (e) {
            console.log('Login failed:', JSON.stringify(e));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (
        name: string,
        email: string,
        password: string,
        acceptedTerms: boolean,
    ): Promise<boolean> => {
        setIsLoading(true);
        try {
            await api.post('/user', { name, email, password, acceptedTerms });
            // After signup, log in to get the token
            const loginOk = await login(email, password);
            return loginOk;
        } catch {
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setAuth(null);
        setToken(null);
        delete api.defaults.headers.common['authorization'];
    };

    return (
        <AuthContext.Provider
            value={{
                auth,
                token,
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
