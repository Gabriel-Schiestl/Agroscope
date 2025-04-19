import api, { ensureCsrfToken } from "../../shared/http/http.config";

export default async function LoginAPI(email: string, password: string) {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return true;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return false;
  }
}
