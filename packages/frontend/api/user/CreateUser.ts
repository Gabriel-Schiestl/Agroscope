import api from "../../shared/http/http.config";

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
  planId?: string;
}

export default async function CreateUserAPI(
  userData: CreateUserParams
): Promise<boolean> {
  try {
    await api.post("/user", userData);
    return true;
  } catch (error) {
    console.error("Error creating user:", error);
    return false;
  }
}
