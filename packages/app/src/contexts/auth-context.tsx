import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from 'react';
import tokenStorage from '@/shared/storage/token-storage';
import api from '@/shared/http/http.config';
import Validate from '../../api/login/Validate';

const TOKEN_KEY = 'agroscope-token';

interface AuthState {
    isEngineer: boolean;
    isAdmin: boolean;
    name: string;
    email: string;
    planId?: string;
}

export interface LoginResult {
    success: boolean;
    blocked?: boolean;
}

export interface SignupResult {
    success: boolean;
    message?: string;
}

interface AuthContextType {
    auth: AuthState | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<LoginResult>;
    signup: (
        name: string,
        email: string,
        password: string,
        acceptedTerms: boolean,
    ) => Promise<SignupResult>;
    logout: () => void;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    auth: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    login: async () => ({ success: false }),
    signup: async () => ({ success: false }),
    logout: () => {},
    refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<AuthState | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const validateAuth = useCallback(async () => {
        const response = await Validate();
        if (response) {
            setAuth({
                isEngineer: response.isEngineer,
                isAdmin: response.isAdmin || false,
                name: response.name,
                email: response.email,
                planId: response.planId,
            });
        } else {
            setAuth(null);
        }
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const storedToken = await tokenStorage.getItem(TOKEN_KEY);
                if (storedToken) {
                    setToken(storedToken);
                    api.defaults.headers.common['authorization'] = storedToken;
                    await validateAuth();
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [validateAuth]);

    const login = async (
        email: string,
        password: string,
    ): Promise<LoginResult> => {
        setIsLoading(true);
        try {
            const response = await api.post<{ token: string }>(
                '/auth/login',
                { email, password },
            );
            const { token: authToken } = response.data;
            await tokenStorage.setItem(TOKEN_KEY, authToken);
            setToken(authToken);
            api.defaults.headers.common['authorization'] = authToken;
            await validateAuth();
            return { success: true };
        } catch (e: any) {
            console.log('Login failed:', JSON.stringify(e));
            const message = e?.response?.data?.message;
            const blocked =
                typeof message === 'string' &&
                message.toLowerCase().includes('blocked');
            return { success: false, blocked };
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (
        name: string,
        email: string,
        password: string,
        acceptedTerms: boolean,
    ): Promise<SignupResult> => {
        setIsLoading(true);
        try {
            await api.post('/user', { name, email, password, acceptedTerms });
            // Após o cadastro, efetua login para obter o token da sessão.
            const loginResult = await login(email, password);
            return { success: loginResult.success };
        } catch (e: any) {
            const message = e?.response?.data?.message;
            return {
                success: false,
                message: typeof message === 'string' ? message : undefined,
            };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setAuth(null);
        setToken(null);
        delete api.defaults.headers.common['authorization'];
        tokenStorage.deleteItem(TOKEN_KEY).catch(() => {});
    };

    const refreshAuth = async () => {
        await validateAuth();
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
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
