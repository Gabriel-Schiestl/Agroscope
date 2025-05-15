import { dashboardUseCases } from './dashboard';
import { GetHistoryUseCase } from './GetHistory.usecase';
import { PredictUseCase } from './Predict.usecase';
import { userUseCases } from './user';

export const useCases = [
    ...userUseCases,
    PredictUseCase,
    GetHistoryUseCase,
    ...dashboardUseCases,
];
