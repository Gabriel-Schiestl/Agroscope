import { Calendar } from '../../domain/models/Calendar';
import { CalendarDto } from '../dto/Calendar.dto';
import { CalendarEventAppMapper } from './CalendarEvent.mapper';

export class CalendarAppMapper {
    static toDto(calendar: Calendar): CalendarDto {
        return {
            id: calendar.id,
            userId: calendar.userId,
            name: calendar.name,
            events: calendar.events.map((event) =>
                CalendarEventAppMapper.toDto(event),
            ),
            createdAt: calendar.createdAt,
            updatedAt: calendar.updatedAt,
        };
    }
}
