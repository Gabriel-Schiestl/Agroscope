import { Res } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Plan } from '../../../domain/models/Plan';
import { PlanRepository } from '../../../domain/repositories/Plan.repository';
import { GetAllPlansQuery } from '../GetAllPlans.query';

describe('GetAllPlansQuery', () => {
    const buildPlan = (type: string) => {
        const result = Plan.create({
            type,
            imageLimit: 10,
            chatLimit: 20,
            features: [],
            featureFlags: [],
            price: 0,
        });
        if (result.isFailure()) throw new Error('setup failed');
        return result.value;
    };

    let planRepository: jest.Mocked<PlanRepository>;
    let query: GetAllPlansQuery;

    beforeEach(() => {
        planRepository = {
            getById: jest.fn(),
            getByType: jest.fn(),
            getAll: jest
                .fn()
                .mockResolvedValue(
                    Res.success([buildPlan('FREE'), buildPlan('PRO')]),
                ),
        };
        query = new GetAllPlansQuery(planRepository);
    });

    it('should return all plans mapped to DTOs', async () => {
        const result = await query.execute();

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value).toHaveLength(2);
        expect(result.isSuccess() && result.value[0].type).toBe('FREE');
        expect(result.isSuccess() && result.value[1].type).toBe('PRO');
    });

    it('should propagate a repository failure', async () => {
        const error = new TechnicalException('db error');
        planRepository.getAll.mockResolvedValue(Res.failure(error));

        const result = await query.execute();

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });
});
