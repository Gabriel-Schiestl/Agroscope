import { Injectable } from '@nestjs/common';
import {
    AuthenticationRepository,
    AuthenticationRepositoryExceptions,
} from '../../domain/repositories/Authentication.repository';
import { Res, Result } from 'src/shared/Result';
import { Authentication } from '../../domain/models/Authentication';
import { AuthenticationMapper } from '../mappers/Authentication.mapper';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { AuthenticationModel } from '../models/Authentication.model';

@Injectable()
export class AuthenticationDataRepository implements AuthenticationRepository {
    constructor(private readonly authenticationMapper: AuthenticationMapper) {}

    async save(
        authentication: Authentication,
    ): Promise<Result<AuthenticationRepositoryExceptions, void>> {
        try {
            const model =
                this.authenticationMapper.domainToModel(authentication);
            await model.save();

            return Res.success();
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }

    async findByEmail(
        email: string,
    ): Promise<Result<AuthenticationRepositoryExceptions, Authentication>> {
        try {
            const model = await AuthenticationModel.findOneBy({ email });
            if (!model) {
                return Res.failure(
                    new TechnicalException('Authentication not found'),
                );
            }

            return Res.success(this.authenticationMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }
}
