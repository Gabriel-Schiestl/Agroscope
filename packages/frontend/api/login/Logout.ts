import api from "../../shared/http/http.config";

export default async function LogoutAPI(): Promise<boolean> {
  try {
    await api.post("/auth/logout");
    return true;
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return false;
  }
}
