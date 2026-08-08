import { Plan } from '../../domain/models/Plan';
import { PlanDto } from '../dto/Plan.dto';

export class PlanAppMapper {
    static toDto(plan: Plan): PlanDto {
        return {
            id: plan.id,
            type: plan.type,
            imageLimit: plan.imageLimit,
            chatLimit: plan.chatLimit,
            features: plan.features,
            featureFlags: plan.featureFlags,
            price: plan.price,
        };
    }
}
