import { CreateCalendarUseCase } from './CreateCalendar.usecase';
import { CreateEventUseCase } from './CreateEvent.usecase';
import { GetEventsUseCase } from './GetEvents.usecase';
import { GetEventsByClientUseCase } from './GetEventsByClient.usecase';
import { GetLastEventsUseCase } from './GetLastEvents.usecase';

export const calendarUseCases = [
    GetEventsByClientUseCase,
    GetEventsUseCase,
    GetLastEventsUseCase,
    CreateEventUseCase,
    CreateCalendarUseCase,
];
