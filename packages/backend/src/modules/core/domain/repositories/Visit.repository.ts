import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import { Report } from '../models/Report';
import { Visit } from '../models/Visit';

export type VisitRepositoryExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

export interface VisitRepository {
    save(visit: Visit): Promise<Result<VisitRepositoryExceptions, void>>;
    getById(id: string): Promise<Result<VisitRepositoryExceptions, Visit>>;
    getVisits(
        clientId: string,
    ): Promise<Result<VisitRepositoryExceptions, Visit[]>>;
    getLastVisits(
        engineerId: string,
    ): Promise<Result<VisitRepositoryExceptions, Visit[]>>;
}
