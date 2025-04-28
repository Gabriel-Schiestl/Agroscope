import api from "../../shared/http/http.config";
import { User } from "../../src/models/User";

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
}

export default async function CreateUserAPI(
  userData: CreateUserParams
): Promise<User | null> {
  try {
    const response = await api.post("/user", userData);
    return response.data as User;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}
