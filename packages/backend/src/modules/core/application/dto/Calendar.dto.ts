import { CalendarEventDto } from './CalendarEvent.dto';

export class CalendarDto {
    id: string;
    userId: string;
    name?: string;
    events: CalendarEventDto[];
    createdAt?: Date;
    updatedAt?: Date;
}
