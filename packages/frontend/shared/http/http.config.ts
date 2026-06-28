import axios from "axios";
import { createMockAdapter } from "../../src/mocks/presentation-mocks";

const isMockMode = process.env.NEXT_PUBLIC_MOCK === "true";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 60000,
});

if (isMockMode) {
  api.defaults.adapter = createMockAdapter(api.defaults.adapter as any);
}

let cachedCsrfToken: string | null = null;
let tokenPromise: Promise<void> | null = null;

api.interceptors.request.use(async (config) => {
  if (!isMockMode) {
    await ensureCsrfToken();
    if (cachedCsrfToken) {
      config.headers["X-CSRF-TOKEN"] = cachedCsrfToken;
    }
  }
  return config;
});

export async function ensureCsrfToken() {
  if (cachedCsrfToken) {
    return;
  }

  if (tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = (async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/csrf/token`,
        {
          withCredentials: true,
        }
      );

      cachedCsrfToken = response.data.csrfToken;
    } catch (error) {
      console.error("Erro ao obter CSRF token:", error);
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
}

export function initializeCSRF() {
  if (typeof window !== "undefined" && !isMockMode) {
    ensureCsrfToken();
  }
}

export default api;
