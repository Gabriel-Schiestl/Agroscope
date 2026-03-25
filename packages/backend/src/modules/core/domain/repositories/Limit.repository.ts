import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Limit } from '../models/Limit';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';

export type LimitExceptions = RepositoryNoDataFound | TechnicalException;

export interface LimitRepository {
    getLimit(id: string): Promise<Result<LimitExceptions, Limit>>;
    getLimitByUserId(userId: string): Promise<Result<LimitExceptions, Limit>>;
    save(limit: Limit): Promise<Result<LimitExceptions, void>>;
}
