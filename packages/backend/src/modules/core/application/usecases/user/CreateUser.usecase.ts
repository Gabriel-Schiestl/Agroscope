import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from 'src/modules/core/domain/models/User';
import { Plan } from 'src/modules/core/domain/models/Plan';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { PlanRepository } from 'src/modules/core/domain/repositories/Plan.repository';
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
        @Inject('PlanRepository')
        private readonly planRepository: PlanRepository,
        @Inject('TERMS_VERSION')
        private readonly termsVersion: string,
        private readonly eventEmitter: EventEmitter2,
    ) {
        super();
    }
    async onExecute(
        props: CreateUserDto,
    ): Promise<Result<CreateUserUseCaseExceptions, void>> {
        const freePlan = await this.planRepository.getByType(Plan.FREE_TYPE);
        if (freePlan.isFailure()) return Res.failure(freePlan.error);

        const user = User.create({
            ...props,
            planId: freePlan.value.id,
            termsVersion: this.termsVersion,
        });
        if (user.isFailure()) return Res.failure(user.error);

        const result = await this.userRepository.save(user.value);
        if (result.isFailure()) return Res.failure(result.error);

        this.eventEmitter.emit('user.created', {
            id: user.value.id,
            name: user.value.name,
            email: user.value.email,
            password: props.password,
        });

        return Res.success();
    }
}
