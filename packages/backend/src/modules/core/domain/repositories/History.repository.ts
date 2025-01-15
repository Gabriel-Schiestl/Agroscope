import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { History } from '../models/History';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';

export type HistoryExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

export interface HistoryRepository {
    save(history: History): Promise<HistoryExceptions | void>;
    getAll(): Promise<HistoryExceptions | History[]>;
    getById(id: string): Promise<HistoryExceptions | History>;
}
