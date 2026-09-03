import api from "../../shared/http/http.config";
import { Plan } from "../../src/models/Plan";

export default async function GetAllPlansAPI(): Promise<Plan[] | null> {
  try {
    const response = await api.get<Plan[]>("/plan");
    return response.data;
  } catch (error) {
    console.error("Error getting plans:", error);
    return null;
  }
}
