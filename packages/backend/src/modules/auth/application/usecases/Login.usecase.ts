import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Res, Result } from 'src/shared/Result';
import { AuthenticationService } from '../../domain/services/Authentication.service';
import { EncryptionService } from '../../domain/services/Encryption.service';

export interface LoginUseCaseProps {
    email: string;
    password: string;
}

export type LoginUseCaseExceptions =
    | RepositoryNoDataFound
    | UnauthorizedException;

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('AuthenticationRepository')
        private readonly authenticationRepository: AuthenticationRepository,
        @Inject('AuthenticationService')
        private readonly authenticationService: AuthenticationService,
        @Inject('EncryptionService')
        private readonly encryptionService: EncryptionService,
    ) {}

    async execute(
        props: LoginUseCaseProps,
    ): Promise<Result<LoginUseCaseExceptions, string>> {
        const userResult = this.userRepository.getByEmail(props.email);
        const authenticationResult = this.authenticationRepository.findByEmail(
            props.email,
        );

        const [user, authentication] = await Promise.all([
            userResult,
            authenticationResult,
        ]);

        if (authentication.isFailure() || user.isFailure())
            return Res.failure(new UnauthorizedException('Error on login'));

        if (authentication.value.verifyAuthenticationBlocked())
            return Res.failure(
                new UnauthorizedException('Account blocked, contact support'),
            );

        const isPasswordValid = await this.encryptionService.compare(
            props.password,
            authentication.value.password,
        );
        if (isPasswordValid.isFailure())
            return Res.failure(new UnauthorizedException('Error on login'));

        const token = await this.authenticationService.sign({
            email: user.value.email,
            sub: user.value.id,
        });

        const saveAuthentication = await this.authenticationRepository.save(
            authentication.value,
        );
        if (saveAuthentication.isFailure())
            return Res.failure(saveAuthentication.error);

        return Res.success(token);
    }
}
