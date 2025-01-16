import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { History } from '../models/History';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Failure, Success } from 'src/shared/Result';

export type HistoryExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

export interface HistoryRepository {
    save(history: History): Promise<Success<void> | Failure<HistoryExceptions>>;
    getAll(): Promise<Success<History[]> | Failure<HistoryExceptions>>;
    getById(id: string): Promise<Success<History> | Failure<HistoryExceptions>>;
}
