import { CalendarEvent } from "@/models/CalendarEvent";
import api from "../../shared/http/http.config";

export default async function GetAllEventsAPI(): Promise<
  CalendarEvent[] | null
> {
  try {
    const response = await api.get<CalendarEvent[]>("/engineer/events");
    return response.data;
  } catch (error) {
    console.error("Error getting all events:", error);
    return null;
  }
}
