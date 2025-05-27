import api from "../../shared/http/http.config";
import { Report } from "../../src/models/Report";

export default async function GetReportsAPI(
  visitId: string
): Promise<Report[] | null> {
  try {
    const response = await api.get<Report[]>(`/reports/${visitId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting reports:", error);
    return null;
  }
}
