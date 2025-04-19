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
}: RegisterUserProps) {
  try {
    const response = await api.post("/api/user", {
      email,
      name,
      password,
    });

    return true;
  } catch (e) {
    return false;
  }
}
