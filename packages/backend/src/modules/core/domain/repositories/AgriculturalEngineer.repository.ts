import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import { AgriculturalEngineer } from '../models/AgriculturalEngineer';

export type AgriculturalEngineerRepositoryExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

export interface AgriculturalEngineerRepository {
    save(
        agriculturalEngineer: AgriculturalEngineer,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, void>>;
    getById(
        id: string,
    ): Promise<
        Result<AgriculturalEngineerRepositoryExceptions, AgriculturalEngineer>
    >;
    delete(
        id: string,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, void>>;
    getByUserId(
        userId: string,
    ): Promise<
        Result<AgriculturalEngineerRepositoryExceptions, AgriculturalEngineer>
    >;
}
