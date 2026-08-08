import { Inject, Injectable } from '@nestjs/common';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { Exception } from 'src/shared/Exception';
import { Res, Result } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { PlanRepository } from '../../domain/repositories/Plan.repository';
import { UserRepository } from '../../domain/repositories/User.repository';
import { LimitDto } from '../dto/Limit.dto';

export interface GetLimitParams {
    userId: string;
}

@Injectable()
export class GetLimitUseCase extends AbstractUseCase<
    GetLimitParams,
    Exception,
    LimitDto
> {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('PlanRepository')
        private readonly planRepository: PlanRepository,
    ) {
        super();
    }

    protected async onExecute({
        userId,
    }: GetLimitParams): Promise<Result<Exception, LimitDto>> {
        const userResult = await this.userRepository.getById(userId);
        if (userResult.isFailure()) {
            return Res.failure(userResult.error);
        }

        const user = userResult.value;

        if (!user.planId) {
            return Res.failure(new BusinessException('Usuário sem plano ativo'));
        }

        const planResult = await this.planRepository.getById(user.planId);
        if (planResult.isFailure()) {
            return Res.failure(new BusinessException('Plano não encontrado'));
        }

        const plan = planResult.value;

        return Res.success({
            imageRequests: user.limit.imageRequests,
            imageLimit: plan.imageLimit,
            chatRequests: user.limit.chatRequests,
            chatLimit: plan.chatLimit,
            featureFlags: plan.featureFlags,
        });
    }
}
