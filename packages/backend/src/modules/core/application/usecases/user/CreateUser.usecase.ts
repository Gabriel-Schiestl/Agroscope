import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/modules/core/domain/models/User';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { CreateUserDto } from '../../dto/User.dto';

export type CreateUserUseCaseExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

@Injectable()
export class CreateUserUseCase extends AbstractUseCase<
    CreateUserDto,
    CreateUserUseCaseExceptions,
    void
> {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        private readonly eventEmitter: EventEmitter2,
    ) {
        super();
    }
    async onExecute(
        props: CreateUserDto,
    ): Promise<Result<CreateUserUseCaseExceptions, void>> {
        const user = User.create(props);
        if (user.isFailure()) return Res.failure(user.error);

        const result = await this.userRepository.save(user.value);
        if (result.isFailure()) return Res.failure(result.error);

        this.eventEmitter.emit('user.created', {
            ...user.value,
            password: props.password,
        });

        return Res.success();
    }
}
