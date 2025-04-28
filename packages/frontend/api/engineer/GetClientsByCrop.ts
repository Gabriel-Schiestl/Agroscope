import api from "../../shared/http/http.config";
import { Client, Crop } from "../../src/models/Client";

export default async function GetClientsByCropAPI(
  crop: Crop
): Promise<Client[] | null> {
  try {
    const response = await api.get<Client[]>(`/engineer/clients/${crop}`);
    return response.data;
  } catch (error) {
    console.error("Error getting clients by crop:", error);
    return null;
  }
}
