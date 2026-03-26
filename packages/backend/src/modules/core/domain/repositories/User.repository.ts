import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import { User } from '../models/User';

export type UserRepositoryExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

export interface UserRepository {
    save(user: User): Promise<Result<UserRepositoryExceptions, void>>;
    getAll(): Promise<Result<UserRepositoryExceptions, User[]>>;
    getById(id: string): Promise<Result<UserRepositoryExceptions, User>>;
    getByEmail(email: string): Promise<Result<UserRepositoryExceptions, User>>;
}
