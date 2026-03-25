import { Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Plan } from '../../domain/models/Plan';
import {
    PlanExceptions,
    PlanRepository,
} from '../../domain/repositories/Plan.repository';
import { PlanMapper } from '../mappers/Plan.mapper';
import { PlanModel } from '../models/Plan.model';
import { Res, Result } from 'src/shared/Result';

@Injectable()
export class PlanDataRepository implements PlanRepository {
    async getPlan(id: string): Promise<Result<PlanExceptions, Plan>> {
        try {
            const model = await PlanModel.findOneBy({ id });
            if (!model) {
                return Res.failure(new RepositoryNoDataFound('Plan not found'));
            }

            return Res.success(PlanMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }

    async getPlanByType(type: string): Promise<Result<PlanExceptions, Plan>> {
        try {
            const model = await PlanModel.findOneBy({ type });
            if (!model) {
                return Res.failure(new RepositoryNoDataFound('Plan not found'));
            }

            return Res.success(PlanMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }

    async save(plan: Plan): Promise<Result<PlanExceptions, void>> {
        try {
            const model = PlanMapper.domainToModel(plan);
            await model.save();
            return Res.success();
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }
}
