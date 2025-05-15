export enum EventType {
    VISIT = 'visit',
    APPLICATION = 'application',
    COLLECTION = 'collection',
    REPORT = 'report',
    MEETING = 'meeting',
}

export enum EventStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

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
