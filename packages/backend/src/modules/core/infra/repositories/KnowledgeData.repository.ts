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

@Injectable()
export class KnowledgeDataRepository implements KnowledgeRepository {
  async getKnowledge(
    sicknessId: string,
  ): Promise<Knowledge | KnowledgeExceptions> {
    try {
      const model = await KnowledgeModel.findOne({ where: { sicknessId } });
      if (!model) return new RepositoryNoDataFound('Knowledge not found');

      return KnowledgeMapper.modelToDomain(model);
    } catch (e) {
      throw new TechnicalException(e.message);
    }
  }

  async save(knowledge: Knowledge): Promise<void | KnowledgeExceptions> {}
}
