import api, { ensureCsrfToken } from "../../shared/http/http.config";

export default async function LoginAPI(email: string, password: string) {
  try {
    await ensureCsrfToken();

    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    return true;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return false;
  }
}
