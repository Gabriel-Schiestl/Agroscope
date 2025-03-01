import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Knowledge } from '../models/Knowledge';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';

export type KnowledgeExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

export interface KnowledgeRepository {
    getKnowledge(
        sicknessId: string,
    ): Promise<Result<KnowledgeExceptions, Knowledge>>;
    save(knowledge: Knowledge): Promise<Result<KnowledgeExceptions, void>>;
}
