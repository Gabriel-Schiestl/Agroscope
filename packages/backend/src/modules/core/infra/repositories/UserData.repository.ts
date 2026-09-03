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
import { LimitModel } from '../models/Limit.model';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';

@Injectable()
export class UserDataRepository implements UserRepository {
    async save(user: User): Promise<Result<UserRepositoryExceptions, void>> {
        try {
            const model = UserMapper.domainToModel(user);
            await model.save();

            return Res.success();
        } catch (e) {
            if (e.code === '23505' || e.driverError?.code === '23505') {
                return Res.failure(
                    new TechnicalException('O e-mail e senha não conferem'),
                );
            }
            return Res.failure(
                new TechnicalException(
                    e.message ?? 'Erro ao salvar usuário.',
                ),
            );
        }
    }

    async getAll(): Promise<Result<UserRepositoryExceptions, User[]>> {
        try {
            const models = await UserModel.find({
                relations: { limit: true },
            });

            return Res.success(
                models.map((model) => UserMapper.modelToDomain(model)),
            );
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getById(id: string): Promise<Result<UserRepositoryExceptions, User>> {
        try {
            const model = await UserModel.findOne({
                where: { id },
                relations: { limit: true },
            });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('User not found'),
                );
            }

            return Res.success(UserMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getByEmail(
        email: string,
    ): Promise<Result<UserRepositoryExceptions, User>> {
        try {
            const model = await UserModel.findOne({
                where: { email },
                relations: { limit: true },
            });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('User not found'),
                );
            }

            return Res.success(UserMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async resetAllLimits(): Promise<Result<UserRepositoryExceptions, void>> {
        try {
            await LimitModel.createQueryBuilder()
                .update(LimitModel)
                .set({ imageRequests: 0, chatRequests: 0 })
                .execute();

            return Res.success();
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }
}
