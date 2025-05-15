import { CalendarRepositoryImpl } from './CalendarData.repository';

export const repositories = [
    {
        provide: 'CalendarRepository',
        useClass: CalendarRepositoryImpl,
    },
];
