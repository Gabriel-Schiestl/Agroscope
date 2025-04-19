import api from "../../shared/http/http.config";

export interface ValidateResponse {
  isEngineer: boolean;
}

export default async function Validate(
  cookie?: string
): Promise<boolean | ValidateResponse> {
  try {
    const response = await api.get<ValidateResponse>("/api/auth/validate", {
      headers: {
        Authorization: `${cookie}`,
      },
      timeout: 5000,
    });

    return response.data;
  } catch (e) {
    return false;
  }
}
