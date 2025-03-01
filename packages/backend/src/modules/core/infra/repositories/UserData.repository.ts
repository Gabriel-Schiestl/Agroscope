import { Injectable } from '@nestjs/common';
import {
    UserRepository,
    UserRepositoryExceptions,
} from '../../domain/repositories/User.repository';
import { Res, Result } from 'src/shared/Result';
import { User } from '../../domain/models/User';
import { UserMapper } from '../mappers/User.mapper';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { UserModel } from '../models/User.model';

@Injectable()
export class UserDataRepository implements UserRepository {
    constructor(private readonly userMapper: UserMapper) {}

    async save(user: User): Promise<Result<UserRepositoryExceptions, void>> {
        try {
            const model = this.userMapper.domainToModel(user);
            await model.save();

            return Res.success();
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getAll(): Promise<Result<UserRepositoryExceptions, User[]>> {
        try {
            const models = await UserModel.find();

            return Res.success(
                models.map((model) => this.userMapper.modelToDomain(model)),
            );
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getById(id: string): Promise<Result<UserRepositoryExceptions, User>> {
        try {
            const model = await UserModel.findOneBy({ id });

            return Res.success(this.userMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getByEmail(
        email: string,
    ): Promise<Result<UserRepositoryExceptions, User>> {
        try {
            const model = await UserModel.findOneBy({ email });

            return Res.success(this.userMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }
}
