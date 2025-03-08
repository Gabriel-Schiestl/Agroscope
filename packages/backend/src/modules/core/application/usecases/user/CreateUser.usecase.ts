import { Inject, Injectable } from '@nestjs/common';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { CreateUserDto } from '../../dto/User.dto';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { User } from 'src/modules/core/domain/models/User';
import { Authentication } from 'src/modules/auth/domain/models/Authentication';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';

export type CreateUserUseCaseExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

@Injectable()
export class CreateUserUseCase extends AbstractUseCase<
    CreateUserDto,
    CreateUserUseCaseExceptions,
    void
> {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('AuthenticationRepository')
        private readonly authenticationRepository: AuthenticationRepository,
    ) {
        super();
    }
    async execute(
        props: CreateUserDto,
    ): Promise<Result<CreateUserUseCaseExceptions, void>> {
        const user = User.create(props);
        if (user.isFailure()) return Res.failure(user.error);

        const result = await this.userRepository.save(user.value);
        if (result.isFailure()) return Res.failure(result.error);

        const authentication = Authentication.create({
            email: user.value.email,
            password: props.password,
        });
        if (authentication.isFailure())
            return Res.failure(authentication.error);

        const saveAuthentication = await this.authenticationRepository.save(
            authentication.value,
        );
        if (saveAuthentication.isFailure())
            return Res.failure(saveAuthentication.error);

        return Res.success();
    }
}
