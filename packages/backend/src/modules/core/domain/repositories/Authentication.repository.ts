import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import { Authentication } from '../models/Authentication';

export type AuthenticationRepositoryExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

export interface AuthenticationRepository {
    save(
        authentication: Authentication,
    ): Promise<Result<AuthenticationRepositoryExceptions, void>>;
    findByEmail(
        email: string,
    ): Promise<Result<AuthenticationRepositoryExceptions, Authentication>>;
}
