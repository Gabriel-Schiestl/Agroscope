import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';

export type AuthUserRepositoryExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

export interface AuthUserProjection {
    id: string;
    name: string;
    email: string;
    planId?: string;
}

export interface AuthUserRepository {
    getByEmail(
        email: string,
    ): Promise<Result<AuthUserRepositoryExceptions, AuthUserProjection>>;
    getById(
        id: string,
    ): Promise<Result<AuthUserRepositoryExceptions, AuthUserProjection>>;
}
