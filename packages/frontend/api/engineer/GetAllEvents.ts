import { CalendarEvent } from "../../src/models/CalendarEvent";
import api from "../../shared/http/http.config";

export default async function GetAllEventsAPI(): Promise<
  CalendarEvent[] | null
> {
  try {
    const response = await api.get<CalendarEvent[]>("/calendar/events");
    return response.data;
  } catch (error) {
    console.error("Error getting all events:", error);
    return null;
  }
}
