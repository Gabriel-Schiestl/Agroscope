import { Inject, Injectable } from '@nestjs/common';
import { Exception } from 'src/shared/Exception';
import { Res, Result } from 'src/shared/Result';
import { PlanFeature } from '../../domain/models/PlanFeature';
import { HistoryRepository } from '../../domain/repositories/History.repository';
import { PlanRepository } from '../../domain/repositories/Plan.repository';
import { UserRepository } from '../../domain/repositories/User.repository';

@Injectable()
export class HistoryVisibilityService {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('PlanRepository')
        private readonly planRepository: PlanRepository,
        @Inject('HistoryRepository')
        private readonly historyRepository: HistoryRepository,
    ) {}

    async getVisibleIds(
        userId: string,
    ): Promise<Result<Exception, string[] | null>> {
        const userResult = await this.userRepository.getById(userId);
        if (userResult.isFailure()) return Res.failure(userResult.error);

        const planId = userResult.value.planId;
        if (planId) {
            const planResult = await this.planRepository.getById(planId);
            if (planResult.isFailure()) return Res.failure(planResult.error);
            if (planResult.value.hasFeature(PlanFeature.FULL_HISTORY)) {
                return Res.success(null);
            }
        }

        const latest = await this.historyRepository.getByUserId(userId, {
            order: 'DESC',
        });
        if (latest.isFailure()) return Res.failure(latest.error);

        return Res.success(latest.value.slice(0, 1).map((h) => h.id));
    }
}
