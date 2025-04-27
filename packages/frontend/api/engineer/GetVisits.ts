import api from "../../shared/http/http.config";
import { Visit } from "../../src/models/Visit";

export default async function GetVisitsAPI(
  clientId: string
): Promise<Visit[] | null> {
  try {
    const response = await api.get<Visit[]>(`/engineer/visits/${clientId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting visits:", error);
    return null;
  }
}
