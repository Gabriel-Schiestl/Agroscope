import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateAuthenticationUseCase } from '../usecases/CreateAuthentication.usecase';
import { UserDto } from '../dto/User.dto';
import { AuthenticationRepository } from '../../domain/repositories/Authentication.repository';

@Injectable()
export class AuthEventListener {
    constructor(
        private readonly createAuthenticationUseCase: CreateAuthenticationUseCase,
        @Inject('AuthenticationRepository')
        private readonly authenticationRepository: AuthenticationRepository,
    ) {}

    @OnEvent('user.created')
    async handleUserCreated(user: UserDto): Promise<void> {
        const result = await this.createAuthenticationUseCase.execute({
            email: user.email,
            password: user.password,
        });

        if (result.isFailure()) {
            throw result.error;
        }
    }

    @OnEvent('user.deleted')
    async handleUserDeleted(user: { email: string }): Promise<void> {
        const result = await this.authenticationRepository.deleteByEmail(
            user.email,
        );

        if (result.isFailure()) {
            throw result.error;
        }
    }
}
