import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CreateAuthenticationUseCase } from '../usecases/CreateAuthentication.usecase';
import { UserDto } from '../dto/User.dto';

@Injectable()
export class AuthEventListener {
    constructor(
        private readonly createAuthenticationUseCase: CreateAuthenticationUseCase,
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
}
