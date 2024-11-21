import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Knowledge } from '../models/Knowledge';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';

export type KnowledgeExceptions =
  | RepositoryNoDataFound
  | BusinessException
  | TechnicalException;

export interface KnowledgeRepository {
  getKnowledge(sicknessId: string): Promise<Knowledge | KnowledgeExceptions>;
  save(knowledge: Knowledge): Promise<void | KnowledgeExceptions>;
}
