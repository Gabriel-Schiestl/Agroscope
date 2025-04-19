import api, { ensureCsrfToken } from "../../shared/http/http.config";

export interface ValidateResponse {
  isEngineer: boolean;
}

export default async function Validate(
  cookie?: string
): Promise<boolean | ValidateResponse> {
  try {
    const response = await api.get<ValidateResponse>("/auth/validate", {
      headers: {
        Authorization: cookie,
      },
      timeout: 5000,
    });
    console.log("Validate response:", response.data); // Depuração
    return response.data;
  } catch (error) {
    console.error("Erro ao validar cookie:", error); // Depuração
    return false;
  }
}
