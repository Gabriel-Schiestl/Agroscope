import api from "../../shared/http/http.config";

export interface ValidateResponse {
  isEngineer: boolean;
}

export default async function Validate(
  cookie?: string
): Promise<boolean | ValidateResponse> {
  try {
    const response = await api.get<ValidateResponse>("/auth/validate", {
      headers: {
        Authorization: `${cookie}`,
      },
    });

    return response.data;
  } catch (e) {
    return false;
  }
}
