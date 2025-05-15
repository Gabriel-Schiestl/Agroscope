import { EventStatus, EventType } from '../../domain/models/CalendarEvent';

export class CalendarEventDto {
    id: string;
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

export interface CreateCalendarEventDto {
    title: string;
    type: EventType;
    date: Date;
    time: string;
    clientId?: string;
    location?: string;
    description?: string;
}
