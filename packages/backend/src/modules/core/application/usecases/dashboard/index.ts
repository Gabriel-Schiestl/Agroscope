import { GetClientesUseCase } from './GetClients.usecase';
import { GetClientsByCropUseCase } from './GetClientsByCrop.usecase';
import { GetLastVisitsUseCase } from './GetLastVisits.usecase';
import { GetReportsUseCase } from './GetReports.usecase';
import { GetVisitsUseCase } from './GetVisits.usecase';

export const dashboardUseCases = [
    GetClientesUseCase,
    GetVisitsUseCase,
    GetReportsUseCase,
    GetLastVisitsUseCase,
    GetClientsByCropUseCase,
];
