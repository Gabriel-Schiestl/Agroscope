import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Sickness } from '../models/Sickness';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';

export type SicknessExceptions =
  | RepositoryNoDataFound
  | BusinessException
  | TechnicalException;

export interface SicknessRepository {
  getSickness(id: string): Promise<Sickness | SicknessExceptions>;
  getSicknessByName(name: string): Promise<Sickness | SicknessExceptions>;
  save(sickness: Sickness): Promise<void | SicknessExceptions>;
}
