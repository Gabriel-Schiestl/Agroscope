import api from "../../shared/http/http.config";
import { Visit } from "../../src/models/Visit";

export default async function GetLastVisitsAPI(): Promise<Visit[] | null> {
  try {
    const response = await api.get<Visit[]>("/engineer/last-visits");
    return response.data;
  } catch (error) {
    console.error("Error getting last visits:", error);
    return null;
  }
}
