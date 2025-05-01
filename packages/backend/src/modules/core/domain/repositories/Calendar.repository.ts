import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import { Calendar } from '../models/Calendar';
import { CalendarEvent } from '../models/CalendarEvent';

export type CalendarRepositoryExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

export interface CalendarRepository {
    save(
        calendar: Calendar,
    ): Promise<Result<CalendarRepositoryExceptions, void>>;
    findByUserId(
        userId: string,
    ): Promise<Result<CalendarRepositoryExceptions, Calendar>>;
    getLastEvents(
        userId: string,
    ): Promise<Result<CalendarRepositoryExceptions, CalendarEvent[]>>;
}
