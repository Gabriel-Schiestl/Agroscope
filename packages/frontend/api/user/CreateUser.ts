import api from "../../shared/http/http.config";

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
  planId?: string;
}

export interface CreateUserResult {
  success: boolean;
  message?: string;
}

export default async function CreateUserAPI(
  userData: CreateUserParams
): Promise<CreateUserResult> {
  try {
    await api.post("/user", userData);
    return { success: true };
  } catch (error: any) {
    console.error("Error creating user:", error);
    const message = error?.response?.data?.message;
    return {
      success: false,
      message: typeof message === "string" ? message : undefined,
    };
  }
}
