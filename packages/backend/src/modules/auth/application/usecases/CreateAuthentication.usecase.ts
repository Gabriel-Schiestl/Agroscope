import { Inject, Injectable } from '@nestjs/common';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { EncryptionService } from '../../domain/services/Encryption.service';
import { AuthenticationRepository } from '../../domain/repositories/Authentication.repository';
import { AuthenticationDto } from '../dto/Authentication.dto';
import { Authentication } from '../../domain/models/Authentication';

export type CreateAuthenticationUseCaseExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

@Injectable()
export class CreateAuthenticationUseCase extends AbstractUseCase<
    AuthenticationDto,
    CreateAuthenticationUseCaseExceptions,
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
    async onExecute(
        props: AuthenticationDto,
    ): Promise<Result<CreateAuthenticationUseCaseExceptions, void>> {
        const hash = await this.encryptionService.encrypt(props.password);

        const authentication = Authentication.create({
            email: props.email,
            password: hash,
        });
        if (authentication.isFailure())
            return Res.failure(authentication.error);

        const saveAuthentication = await this.authenticationRepository.save(
            authentication.value,
        );
        return saveAuthentication;
    }
}
