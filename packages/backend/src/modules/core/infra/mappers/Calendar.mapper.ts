import { Calendar } from '../../domain/models/Calendar';
import { CalendarModel } from '../models/Calendar.model';
import { CalendarEventMapper } from './CalendarEvent.mapper';

export class CalendarMapper {
    static domainToModel(calendar: Calendar): CalendarModel {
        return new CalendarModel().setProps({
            id: calendar.id,
            userId: calendar.userId,
            name: calendar.name,
            events: calendar.events?.map((event) =>
                CalendarEventMapper.domainToModel(event),
            ),
            createdAt: calendar.createdAt,
        });
    }

    static modelToDomain(calendar: CalendarModel): Calendar {
        return Calendar.load(
            {
                userId: calendar.userId,
                name: calendar.name,
                events: calendar.events?.map((event) =>
                    CalendarEventMapper.modelToDomain(event),
                ),
                createdAt: calendar.createdAt,
                updatedAt: calendar.updatedAt,
            },
            calendar.id,
        );
    }
}
