import { Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Limit } from '../../domain/models/Limit';
import {
    LimitExceptions,
    LimitRepository,
} from '../../domain/repositories/Limit.repository';
import { LimitMapper } from '../mappers/Limit.mapper';
import { LimitModel } from '../models/Limit.model';
import { Res, Result } from 'src/shared/Result';

@Injectable()
export class LimitDataRepository implements LimitRepository {
    async getLimit(id: string): Promise<Result<LimitExceptions, Limit>> {
        try {
            const model = await LimitModel.findOneBy({ id });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('Limit not found'),
                );
            }

            return Res.success(LimitMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }

    async getLimitByUserId(
        userId: string,
    ): Promise<Result<LimitExceptions, Limit>> {
        try {
            const model = await LimitModel.findOneBy({ userId });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('Limit not found'),
                );
            }

            return Res.success(LimitMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }

    async save(limit: Limit): Promise<Result<LimitExceptions, void>> {
        try {
            const model = LimitMapper.domainToModel(limit);
            await model.save();
            return Res.success();
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }
}
