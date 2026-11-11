import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';

export interface UpdateUserProfileUseCaseProps {
    userId: string;
    name: string;
}

export interface UpdateUserProfileUseCaseResult {
    name: string;
    email: string;
}

export type UpdateUserProfileUseCaseExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

@Injectable()
export class UpdateUserProfileUseCase extends AbstractUseCase<
    UpdateUserProfileUseCaseProps,
    UpdateUserProfileUseCaseExceptions,
    UpdateUserProfileUseCaseResult
> {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) {
        super();
    }

    protected async onExecute(
        props: UpdateUserProfileUseCaseProps,
    ): Promise<
        Result<
            UpdateUserProfileUseCaseExceptions,
            UpdateUserProfileUseCaseResult
        >
    > {
        const userResult = await this.userRepository.getById(props.userId);
        if (userResult.isFailure()) return Res.failure(userResult.error);

        const user = userResult.value;

        const changeResult = user.changeName(props.name);
        if (changeResult.isFailure()) return Res.failure(changeResult.error);

        const saveResult = await this.userRepository.save(user);
        if (saveResult.isFailure()) return Res.failure(saveResult.error);

        return Res.success({ name: user.name, email: user.email });
    }
}
