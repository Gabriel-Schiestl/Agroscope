import { CalendarEvent } from '../../domain/models/CalendarEvent';
import { CalendarEventModel } from '../models/CalendarEvent.model';

export class CalendarEventMapper {
    static domainToModel(calendarEvent: CalendarEvent): CalendarEventModel {
        return new CalendarEventModel().setProps({
            id: calendarEvent.id,
            date: calendarEvent.date,
            time: calendarEvent.time,
            title: calendarEvent.title,
            type: calendarEvent.type,
            status: calendarEvent.status,
            clientId: calendarEvent.clientId,
            description: calendarEvent.description,
            location: calendarEvent.location,
            reportId: calendarEvent.reportId,
        });
    }

    static modelToDomain(calendarEvent: CalendarEventModel): CalendarEvent {
        return CalendarEvent.load(
            {
                date: calendarEvent.date,
                time: calendarEvent.time,
                title: calendarEvent.title,
                type: calendarEvent.type,
                status: calendarEvent.status,
                clientId: calendarEvent.clientId,
                description: calendarEvent.description,
                location: calendarEvent.location,
                reportId: calendarEvent.reportId,
            },
            calendarEvent.id,
        );
    }
}
