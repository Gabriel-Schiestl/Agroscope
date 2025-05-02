import { CalendarEvent } from "../../src/models/CalendarEvent";
import api from "../../shared/http/http.config";

export default async function GetEventsAPI(
  clientId: string
): Promise<CalendarEvent[] | null> {
  try {
    const response = await api.get<CalendarEvent[]>(
      `/engineer/events/${clientId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting events:", error);
    return null;
  }
}
