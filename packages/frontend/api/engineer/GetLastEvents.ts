import { CalendarEvent } from "../../src/models/CalendarEvent";
import api from "../../shared/http/http.config";

export default async function GetLastEventsAPI(): Promise<
  CalendarEvent[] | null
> {
  try {
    const response = await api.get<CalendarEvent[]>("/calendar/last-events");
    return response.data;
  } catch (error) {
    console.error("Error getting last events:", error);
    return null;
  }
}
