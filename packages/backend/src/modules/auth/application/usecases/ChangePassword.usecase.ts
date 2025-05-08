import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import generateRandomNumber from 'src/shared/RandomNumberGenerator';
import { Res, Result } from 'src/shared/Result';

export interface ChangePasswordUseCaseProps {
    email: string;
    newPassword: string;
    token: string;
}

export type ChangePasswordUseCaseExceptions =
    | RepositoryNoDataFound
    | UnauthorizedException;

@Injectable()
export class ChangePasswordUseCase {
    constructor(
        @Inject('AuthenticationRepository')
        private readonly authenticationRepository: AuthenticationRepository,
    ) {}

    async execute(
        props: ChangePasswordUseCaseProps,
    ): Promise<Result<ChangePasswordUseCaseExceptions, void>> {
        const authentication = await this.authenticationRepository.findByEmail(
            props.email,
        );
        if (authentication.isFailure())
            return Res.failure(
                new TechnicalException(
                    'An error occurred while changing password',
                ),
            );

        const passwordChange = authentication.value.applyPasswordChange(
            props.token,
            props.newPassword,
        );
        if (passwordChange.isFailure())
            return Res.failure(passwordChange.error);

        const saveResult = await this.authenticationRepository.save(
            authentication.value,
        );
        if (saveResult.isFailure())
            return Res.failure(
                new TechnicalException(
                    'An error occurred while changing password',
                ),
            );

        return Res.success();
    }
}
