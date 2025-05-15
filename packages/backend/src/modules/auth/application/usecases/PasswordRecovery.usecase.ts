import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Res, Result } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import generateRandomNumber from 'src/shared/RandomNumberGenerator';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { ProducerService } from 'src/shared/domain/services/Producer.service';

export interface PasswordRecoveryUseCaseProps {
    email: string;
}

export type PasswordRecoveryUseCaseExceptions =
    | RepositoryNoDataFound
    | UnauthorizedException;

@Injectable()
export class PasswordRecoveryUseCase {
    constructor(
        @Inject('AuthenticationRepository')
        private readonly authenticationRepository: AuthenticationRepository,
        @Inject('EmailProducerService')
        private readonly emailService: ProducerService,
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) {}

    async execute(
        props: PasswordRecoveryUseCaseProps,
    ): Promise<Result<PasswordRecoveryUseCaseExceptions, void>> {
        const authentication = await this.authenticationRepository.findByEmail(
            props.email,
        );
        if (authentication.isFailure())
            return Res.failure(
                new TechnicalException(
                    'An error occurred while sending recovery token',
                ),
            );

        const user = await this.userRepository.getByEmail(props.email);
        if (user.isFailure())
            return Res.failure(
                new TechnicalException(
                    'An error occurred while sending recovery token',
                ),
            );

        const token = generateRandomNumber();

        authentication.value.setRecoveryToken(token);

        const saveAuthenticationResult =
            await this.authenticationRepository.save(authentication.value);
        if (saveAuthenticationResult.isFailure())
            return Res.failure(
                new TechnicalException(
                    'An error occurred while sending recovery token',
                ),
            );

        this.emailService.sendMessage('token', {
            to: authentication.value.email,
            templateId: 6,
            subject: 'Token para recuperação de senha',
            params: {
                name: user.value.name,
                token: token,
            },
        });

        return Res.success();
    }
}
