import { GetHistoryUseCase } from './GetHistory.usecase';
import { GetHistoryByIdUseCase } from './GetHistoryById.usecase';
import { GetLimitUseCase } from './GetLimit.usecase';
import { PredictUseCase } from './Predict.usecase';
import { userUseCases } from './user';

export const useCases = [...userUseCases, PredictUseCase, GetHistoryUseCase, GetHistoryByIdUseCase, GetLimitUseCase];
