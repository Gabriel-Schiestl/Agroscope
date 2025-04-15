import api from "../../shared/http/http.config";

export default async function LoginAPI(email: string, password: string) {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const csrfResponse = await api.get("/csrf/token");
    const csrfToken = csrfResponse.data.csrfToken;
    document.cookie = `csrf-token=${csrfToken}; path=/; secure=${
      process.env.NODE_ENV === "production"
    }; samesite=lax`;

    return true;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return false;
  }
}
