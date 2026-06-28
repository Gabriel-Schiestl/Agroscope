import api from "../../shared/http/http.config";

export interface RegisterUserProps {
  name: string;
  email: string;
  password: string;
}

export default async function RegisterUser({
  email,
  name,
  password,
}: RegisterUserProps): Promise<boolean> {
  try {
    await api.post("/user", { email, name, password });
    return true;
  } catch (e) {
    return false;
  }
}
