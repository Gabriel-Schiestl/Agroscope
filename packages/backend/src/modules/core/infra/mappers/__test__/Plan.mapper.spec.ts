import { Plan } from '../../../domain/models/Plan';
import { PlanModel } from '../../models/Plan.model';
import { PlanMapper } from '../Plan.mapper';

describe('PlanMapper', () => {
    it('should map a Plan domain entity to a PlanModel', () => {
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

        const model = PlanMapper.domainToModel(plan);

        expect(model).toBeInstanceOf(PlanModel);
        expect(model.id).toBe('plan-1');
        expect(model.type).toBe('FREE');
        expect(model.imageLimit).toBe(10);
        expect(model.chatLimit).toBe(20);
        expect(model.features).toEqual(['basic-analysis']);
        expect(model.featureFlags).toEqual(['REPORT_GENERATION']);
        expect(model.price).toBe(0);
    });

    it('should map a PlanModel back to a Plan domain entity', () => {
        const model = new PlanModel();
        model.id = 'plan-1';
        model.type = 'FREE';
        model.imageLimit = 10;
        model.chatLimit = 20;
        model.features = ['basic-analysis'];
        model.featureFlags = ['REPORT_GENERATION'];
        model.price = 0;

        const plan = PlanMapper.modelToDomain(model);

        expect(plan).toBeInstanceOf(Plan);
        expect(plan.id).toBe('plan-1');
        expect(plan.type).toBe('FREE');
        expect(plan.hasFeature('REPORT_GENERATION')).toBe(true);
    });
});
