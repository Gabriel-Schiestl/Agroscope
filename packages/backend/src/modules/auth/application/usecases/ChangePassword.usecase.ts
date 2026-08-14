import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { EncryptionService } from '../../domain/services/Encryption.service';

export interface ChangePasswordUseCaseProps {
    email: string;
    newPassword: string;
    token: string;
}

export type ChangePasswordUseCaseExceptions =
    | RepositoryNoDataFound
    | UnauthorizedException;

@Injectable()
export class ChangePasswordUseCase extends AbstractUseCase<
    ChangePasswordUseCaseProps,
    ChangePasswordUseCaseExceptions,
    void
> {
    constructor(
        @Inject('AuthenticationRepository')
        private readonly authenticationRepository: AuthenticationRepository,
        @Inject('EncryptionService')
        private readonly encryptionService: EncryptionService,
    ) {
        super();
    }

    protected async onExecute(
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

        const hash = await this.encryptionService.encrypt(props.newPassword);

        const passwordChange = authentication.value.applyPasswordChange(
            props.token,
            hash,
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
