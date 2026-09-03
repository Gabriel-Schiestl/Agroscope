import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { PlanRepository } from 'src/modules/core/domain/repositories/Plan.repository';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';

export interface ChangeUserPlanUseCaseProps {
    userId: string;
    planId: string;
}

export type ChangeUserPlanUseCaseExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

@Injectable()
export class ChangeUserPlanUseCase extends AbstractUseCase<
    ChangeUserPlanUseCaseProps,
    ChangeUserPlanUseCaseExceptions,
    void
> {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('PlanRepository')
        private readonly planRepository: PlanRepository,
    ) {
        super();
    }

    protected async onExecute(
        props: ChangeUserPlanUseCaseProps,
    ): Promise<Result<ChangeUserPlanUseCaseExceptions, void>> {
        const userResult = await this.userRepository.getById(props.userId);
        if (userResult.isFailure()) return Res.failure(userResult.error);

        const planResult = await this.planRepository.getById(props.planId);
        if (planResult.isFailure()) return Res.failure(planResult.error);

        const changeResult = userResult.value.changePlan(planResult.value.id);
        if (changeResult.isFailure()) return Res.failure(changeResult.error);

        const saveResult = await this.userRepository.save(userResult.value);
        if (saveResult.isFailure()) return Res.failure(saveResult.error);

        return Res.success();
    }
}
