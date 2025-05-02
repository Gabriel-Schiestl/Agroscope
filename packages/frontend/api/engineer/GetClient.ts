import { Client } from "../../src/models/Client";
import api from "../../shared/http/http.config";

export default async function GetClientAPI(
  clientId: string
): Promise<Client | null> {
  try {
    const response = await api.get(`/engineer/clients/${clientId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return null;
  }
}
