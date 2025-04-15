import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    if (
      ["post", "put", "delete"].includes(config.method?.toLowerCase() ?? "")
    ) {
      let csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf-token="))
        ?.split("=")[1];

      if (!csrfToken) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/csrf/token`,
            {
              withCredentials: true,
            }
          );
          csrfToken = response.data.csrfToken;
          document.cookie = `csrf-token=${csrfToken}; path=/; secure=${
            process.env.NODE_ENV === "production"
          }; samesite=lax`;
        } catch (error) {
          console.error("Erro ao obter token CSRF:", error);
        }
      }

      if (csrfToken) {
        config.headers["X-CSRF-TOKEN"] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
