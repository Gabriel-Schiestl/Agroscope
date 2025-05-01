export enum EventType {
  VISIT = "visit",
  APPLICATION = "application",
  COLLECTION = "collection",
  REPORT = "report",
  MEETING = "meeting",
}

export enum EventStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface CalendarEvent {
  title: string;
  type: EventType;
  status: EventStatus;
  date: Date;
  time: string;
  clientId?: string;
  location?: string;
  description?: string;
  reportId?: string;
}
