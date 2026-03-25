import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Plan } from '../models/Plan';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';

export type PlanExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

export interface PlanRepository {
    getPlan(id: string): Promise<Result<PlanExceptions, Plan>>;
    getPlanByType(type: string): Promise<Result<PlanExceptions, Plan>>;
    save(plan: Plan): Promise<Result<PlanExceptions, void>>;
}
