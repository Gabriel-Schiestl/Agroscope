import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';

export interface ValidateRecoveryTokenUseCaseProps {
    email: string;
    token: string;
}

export type ValidateRecoveryTokenUseCaseExceptions =
    | RepositoryNoDataFound
    | UnauthorizedException;

@Injectable()
export class ValidateRecoveryTokenUseCase extends AbstractUseCase<
    ValidateRecoveryTokenUseCaseProps,
    ValidateRecoveryTokenUseCaseExceptions,
    void
> {
    constructor(
        @Inject('AuthenticationRepository')
        private readonly authenticationRepository: AuthenticationRepository,
    ) {
        super();
    }

    protected async onExecute(
        props: ValidateRecoveryTokenUseCaseProps,
    ): Promise<Result<ValidateRecoveryTokenUseCaseExceptions, void>> {
        const authentication = await this.authenticationRepository.findByEmail(
            props.email,
        );
        if (authentication.isFailure())
            return Res.failure(
                new TechnicalException(
                    'An error occurred while validating recovery token',
                ),
            );

        const validateToken = authentication.value.validateRecoveryToken(
            props.token,
        );
        if (validateToken.isFailure()) return Res.failure(validateToken.error);

        return Res.success();
    }
}
