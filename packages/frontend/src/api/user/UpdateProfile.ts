import api from "../../../shared/http/http.config";

export interface UpdateProfileResult {
  success: boolean;
  message?: string;
}

export default async function UpdateProfileAPI(
  name: string
): Promise<UpdateProfileResult> {
  try {
    await api.patch("/user", { name });
    return { success: true };
  } catch (error: any) {
    const message = error?.response?.data?.message;
    return {
      success: false,
      message: typeof message === "string" ? message : undefined,
    };
  }
}
