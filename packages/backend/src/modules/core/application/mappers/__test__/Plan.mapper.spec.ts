import { Plan } from '../../../domain/models/Plan';
import { PlanAppMapper } from '../Plan.mapper';

describe('PlanAppMapper', () => {
    it('should map a Plan domain entity to a PlanDto', () => {
        const plan = Plan.load(
            {
                type: 'FREE',
                imageLimit: 10,
                chatLimit: 20,
                features: ['basic-analysis'],
                featureFlags: ['REPORT_GENERATION'],
                price: 0,
            },
            'plan-1',
        );

        const dto = PlanAppMapper.toDto(plan);

        expect(dto).toEqual({
            id: 'plan-1',
            type: 'FREE',
            imageLimit: 10,
            chatLimit: 20,
            features: ['basic-analysis'],
            featureFlags: ['REPORT_GENERATION'],
            price: 0,
        });
    });
});
