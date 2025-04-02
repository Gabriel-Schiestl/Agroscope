import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { History } from '../models/History';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Failure, Result, Success } from 'src/shared/Result';

export type HistoryExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

export interface HistoryRepository {
    save(history: History): Promise<Result<HistoryExceptions, void>>;
    getAll(): Promise<Result<HistoryExceptions, History[]>>;
    getById(id: string): Promise<Result<HistoryExceptions, History>>;
    getByClientId(
        clientId: string,
    ): Promise<Result<HistoryExceptions, History[]>>;
    getByUserId(userId: string): Promise<Result<HistoryExceptions, History[]>>;
}
