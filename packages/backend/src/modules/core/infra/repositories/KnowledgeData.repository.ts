import { Injectable } from '@nestjs/common';
import {
    KnowledgeExceptions,
    KnowledgeRepository,
} from '../../domain/repositories/Knowledge.repository';
import { Knowledge } from '../../domain/models/Knowledge';
import { KnowledgeModel } from '../models/Knowledge.model';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { KnowledgeMapper } from '../mappers/Knowledge.mapper';
import { Res, Result } from 'src/shared/Result';

@Injectable()
export class KnowledgeDataRepository implements KnowledgeRepository {
    async getKnowledge(
        sicknessId: string,
    ): Promise<Result<KnowledgeExceptions, Knowledge>> {
        try {
            const model = await KnowledgeModel.findOne({
                where: { sicknessId },
            });
            if (!model)
                return Res.failure(
                    new RepositoryNoDataFound('Knowledge not found'),
                );

            return Res.success(KnowledgeMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }

    async save(
        knowledge: Knowledge,
    ): Promise<Result<TechnicalException, void>> {
        try {
            const model = KnowledgeMapper.domainToModel(knowledge);
            await model.save();
            return Res.success();
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }
}
