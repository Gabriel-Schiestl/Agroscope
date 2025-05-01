import { GetAllReportsUseCase } from './GetAllReports.usecase';
import { GetClientUseCase } from './GetClient.usecase';
import { GetClientesUseCase } from './GetClients.usecase';
import { GetClientsByCropUseCase } from './GetClientsByCrop.usecase';
import { GetEventsUseCase } from './GetEvents.usecase';
import { GetEventsByClientUseCase } from './GetEventsByClient.usecase';
import { GetLastEventsUseCase } from './GetLastEvents.usecase';
import { GetReportsUseCase } from './GetReports.usecase';

export const dashboardUseCases = [
    GetClientesUseCase,
    GetReportsUseCase,
    GetLastEventsUseCase,
    GetClientsByCropUseCase,
    GetAllReportsUseCase,
    GetClientUseCase,
    GetEventsByClientUseCase,
    GetEventsUseCase,
];
