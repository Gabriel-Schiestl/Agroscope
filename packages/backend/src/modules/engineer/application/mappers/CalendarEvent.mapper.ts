import { CalendarEvent } from '../../domain/models/Calendar';
import { CalendarEventDto } from '../dto/CalendarEvent.dto';

export class CalendarEventAppMapper {
    static toDto(event: CalendarEvent): CalendarEventDto {
        return {
            id: event.id,
            title: event.title,
            type: event.type,
            status: event.status,
            date: event.date,
            time: event.time,
            clientId: event.clientId,
            location: event.location,
            description: event.description,
            reportId: event.reportId,
        };
    }
}
