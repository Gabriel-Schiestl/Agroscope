import { CalendarEvent } from "./CalendarEvent";

export interface Calendar {
  userId: string;
  name?: string;
  events: CalendarEvent[];
  createdAt?: Date;
  updatedAt?: Date;
}
