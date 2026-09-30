import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Plan } from '../Plan';

describe('Plan Domain', () => {
    const validProps = {
        type: 'FREE',
        imageLimit: 10,
        chatLimit: 20,
        features: ['basic-analysis'],
        featureFlags: ['REPORT_GENERATION'],
        price: 0,
    };

    it('should create a plan successfully', () => {
        const result = Plan.create(validProps);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value).toBeInstanceOf(Plan);
            expect(result.value.type).toBe('FREE');
            expect(result.value.imageLimit).toBe(10);
            expect(result.value.chatLimit).toBe(20);
            expect(result.value.features).toEqual(['basic-analysis']);
            expect(result.value.featureFlags).toEqual(['REPORT_GENERATION']);
            expect(result.value.price).toBe(0);
        }
    });

    it('should fail without a type', () => {
        const result = Plan.create({ ...validProps, type: '' });
        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should fail with a negative image limit', () => {
        const result = Plan.create({ ...validProps, imageLimit: -1 });
        expect(result.isFailure()).toBe(true);
    });

    it('should fail with a negative chat limit', () => {
        const result = Plan.create({ ...validProps, chatLimit: -1 });
        expect(result.isFailure()).toBe(true);
    });

    it('should fail with a negative price', () => {
        const result = Plan.create({ ...validProps, price: -1 });
        expect(result.isFailure()).toBe(true);
    });

    it('should fail without features', () => {
        const result = Plan.create({ ...validProps, features: undefined });
        expect(result.isFailure()).toBe(true);
    });

    it('should fail without feature flags', () => {
        const result = Plan.create({
            ...validProps,
            featureFlags: undefined,
        });
        expect(result.isFailure()).toBe(true);
    });

    it('should load a plan with a given id', () => {
        const plan = Plan.load(validProps, 'plan-1');
        expect(plan.id).toBe('plan-1');
        expect(plan.type).toBe('FREE');
    });

    describe('hasFeature', () => {
        it('should return true when the plan has the feature flag', () => {
            const plan = Plan.load(validProps, 'plan-1');
            expect(plan.hasFeature('REPORT_GENERATION')).toBe(true);
        });

        it('should return false when the plan does not have the feature flag', () => {
            const plan = Plan.load(validProps, 'plan-1');
            expect(plan.hasFeature('UNKNOWN_FEATURE')).toBe(false);
        });
    });
});
