import api from "../../shared/http/http.config";
import { History } from "../../src/models/History";

export default async function GetHistoryAPI(): Promise<History[] | null> {
  try {
    const response = await api.get<History[]>("/history");
    return response.data;
  } catch (error) {
    console.error("Error getting history:", error);
    return null;
  }
}
