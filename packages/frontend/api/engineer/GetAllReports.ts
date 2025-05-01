import api from "../../shared/http/http.config";
import { Report } from "../../src/models/Report";

export default async function GetAllReportsAPI(): Promise<Report[] | null> {
  try {
    const response = await api.get<Report[]>(`/engineer/reports`);
    return response.data;
  } catch (error) {
    console.error("Error getting reports:", error);
    return null;
  }
}
