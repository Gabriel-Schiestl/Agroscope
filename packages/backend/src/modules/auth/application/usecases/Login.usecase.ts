import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationRepository } from 'src/modules/auth/domain/repositories/Authentication.repository';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Res, Result } from 'src/shared/Result';
import {
    AuthenticationService,
    JwtPayload,
} from '../../domain/services/Authentication.service';
import { EncryptionService } from '../../domain/services/Encryption.service';
import { AgriculturalEngineerRepository } from 'src/modules/engineer/domain/repositories/AgriculturalEngineer.repository';
import { AESService } from '../../domain/services/AES.service';

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
        @Inject('AgriculturalEngineerRepository')
        private readonly agriculturalEngineerRepository: AgriculturalEngineerRepository,
        @Inject('AESService')
        private readonly aesService: AESService,
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
        if (isPasswordValid.isFailure()) {
            authentication.value.incrementIncorrectPasswordAttempts();

            await this.authenticationRepository.save(authentication.value);

            return Res.failure(new UnauthorizedException('Error on login'));
        }

        const jwtPayload: JwtPayload = {
            name: user.value.name,
            email: user.value.email,
            sub: user.value.id,
            engineer: false,
        };

        const isEngineer =
            await this.agriculturalEngineerRepository.getByUserId(
                user.value.id,
            );
        if (isEngineer.isSuccess()) {
            jwtPayload.engineer = true;
        }

        const token = await this.authenticationService.sign(jwtPayload);

        authentication.value.applyLogin();

        const saveAuthentication = await this.authenticationRepository.save(
            authentication.value,
        );
        if (saveAuthentication.isFailure())
            return Res.failure(saveAuthentication.error);

        const encryptedToken = await this.aesService.encrypt(token);
        if (encryptedToken.isFailure()) {
            return Res.failure(new UnauthorizedException('Error on login'));
        }

        return Res.success(encryptedToken.value);
    }
}
