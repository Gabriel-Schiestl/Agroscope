import api from "../../shared/http/http.config";

export interface LoginResult {
  success: boolean;
  blocked?: boolean;
}

export default async function LoginAPI(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    await api.post("/auth/login", {
      email,
      password,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao fazer login:", error);
    const message = error?.response?.data?.message;
    const blocked =
      typeof message === "string" && message.toLowerCase().includes("blocked");
    return { success: false, blocked };
  }
}
