import api from "../../shared/http/http.config";
import { Client } from "../../src/models/Client";

export default async function GetClientsAPI(): Promise<Client[] | null> {
  try {
    const response = await api.get<Client[]>("/engineer/clients");
    return response.data;
  } catch (error) {
    console.error("Error getting clients:", error);
    return null;
  }
}
