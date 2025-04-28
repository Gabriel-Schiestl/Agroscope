import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { History } from '../models/History';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Failure, Result, Success } from 'src/shared/Result';
import { Report } from '../models/Report';

export type ReportExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

export interface ReportRepository {
    save(Report: Report): Promise<Result<ReportExceptions, void>>;
    getByEngineerId(
        engineerId: string,
    ): Promise<Result<ReportExceptions, Report[]>>;
    getByVisitId(visitId: string): Promise<Result<ReportExceptions, Report[]>>;
    getByClientId(
        clientId: string,
    ): Promise<Result<ReportExceptions, Report[]>>;
}
