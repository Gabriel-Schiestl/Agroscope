import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import { History } from '../models/History';

export type HistoryExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

export interface HistoryFilters {
    crop?: string;
    startDate?: Date;
    endDate?: Date;
    order?: 'ASC' | 'DESC';
}

export interface HistoryRepository {
    save(history: History): Promise<Result<HistoryExceptions, void>>;
    getAll(): Promise<Result<HistoryExceptions, History[]>>;
    getById(id: string): Promise<Result<HistoryExceptions, History>>;
    getByUserId(
        userId: string,
        filters?: HistoryFilters,
    ): Promise<Result<HistoryExceptions, History[]>>;
}
