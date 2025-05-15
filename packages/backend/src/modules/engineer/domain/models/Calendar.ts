export interface Calendar {
    id: string;
    userId: string;
    name?: string;
    events: CalendarEvent[];
    createdAt?: Date;
    updatedAt?: Date;
}

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

export interface CalendarEvent {
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
