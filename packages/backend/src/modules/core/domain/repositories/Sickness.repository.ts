import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Sickness } from '../models/Sickness';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';

export type SicknessExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

export interface SicknessRepository {
    getSickness(id: string): Promise<Result<SicknessExceptions, Sickness>>;
    getSicknessByName(
        name: string,
    ): Promise<Result<SicknessExceptions, Sickness>>;
    save(sickness: Sickness): Promise<Result<SicknessExceptions, void>>;
}
