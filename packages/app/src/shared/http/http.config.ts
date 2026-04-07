import axios from 'axios';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 30000,
});

let cachedCsrfToken: string | null = null;
let tokenPromise: Promise<void> | null = null;

async function ensureCsrfToken() {
    if (cachedCsrfToken) return;

    if (tokenPromise) {
        return tokenPromise;
    }

    tokenPromise = (async () => {
        try {
            const response = await axios.get(
                `${api.defaults.baseURL}/auth/csrf/token`,
            );
            cachedCsrfToken = response.data.csrfToken;
        } catch (error) {
            console.error('Erro ao obter CSRF token:', error);
        } finally {
            tokenPromise = null;
        }
    })();

    return tokenPromise;
}

api.interceptors.request.use(async (config) => {
    const method = config.method?.toUpperCase();
    if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        await ensureCsrfToken();
        if (cachedCsrfToken) {
            config.headers['X-CSRF-TOKEN'] = cachedCsrfToken;
        }
    }
    return config;
});

export function clearCsrfToken() {
    cachedCsrfToken = null;
}

export default api;
