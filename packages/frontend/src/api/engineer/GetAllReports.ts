import api from "../../../shared/http/http.config";
import { Report } from "../../models/Report";

export default async function GetAllReportsAPI(): Promise<Report[] | null> {
  try {
    const response = await api.get<Report[]>(`/reports`);
    return response.data;
  } catch (error) {
    console.error("Error getting reports:", error);
    return null;
  }
}
