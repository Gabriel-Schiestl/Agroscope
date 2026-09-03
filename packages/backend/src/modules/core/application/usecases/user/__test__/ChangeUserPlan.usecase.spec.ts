import { Res } from 'src/shared/Result';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Limit } from 'src/modules/core/domain/models/Limit';
import { Plan } from 'src/modules/core/domain/models/Plan';
import { User } from 'src/modules/core/domain/models/User';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { PlanRepository } from 'src/modules/core/domain/repositories/Plan.repository';
import { ChangeUserPlanUseCase } from '../ChangeUserPlan.usecase';

describe('ChangeUserPlanUseCase', () => {
    const buildUser = () =>
        User.load(
            {
                name: 'Gabriel',
                email: 'gabriel@example.com',
                limit: Limit.create(),
                planId: 'plan-old',
            },
            'user-1',
        );

    const buildPlan = () => {
        const result = Plan.create({
            type: 'PRO',
            imageLimit: 100,
            chatLimit: 200,
            features: [],
            featureFlags: [],
            price: 20,
        });
        if (result.isFailure()) throw new Error('setup failed');
        return result.value;
    };

    let userRepository: jest.Mocked<UserRepository>;
    let planRepository: jest.Mocked<PlanRepository>;
    let useCase: ChangeUserPlanUseCase;
    let plan: Plan;

    beforeEach(() => {
        plan = buildPlan();
        userRepository = {
            save: jest.fn().mockResolvedValue(Res.success(undefined)),
            getAll: jest.fn(),
            getById: jest.fn().mockResolvedValue(Res.success(buildUser())),
            getByEmail: jest.fn(),
            resetAllLimits: jest.fn(),
        };
        planRepository = {
            getById: jest.fn().mockResolvedValue(Res.success(plan)),
            getByType: jest.fn(),
            getAll: jest.fn(),
        };
        useCase = new ChangeUserPlanUseCase(userRepository, planRepository);
    });

    it('should change the plan and save the user', async () => {
        const result = await useCase.execute({
            userId: 'user-1',
            planId: 'plan-new',
        });

        expect(result.isSuccess()).toBe(true);
        expect(userRepository.save).toHaveBeenCalled();
        const savedUser = userRepository.save.mock.calls[0][0] as User;
        expect(savedUser.planId).toBe(plan.id);
    });

    it('should fail when the user is not found', async () => {
        const error = new RepositoryNoDataFound('user not found');
        userRepository.getById.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute({
            userId: 'unknown',
            planId: 'plan-new',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when the plan is not found', async () => {
        const error = new RepositoryNoDataFound('plan not found');
        planRepository.getById.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute({
            userId: 'user-1',
            planId: 'unknown',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate a save failure', async () => {
        const error = new RepositoryNoDataFound('could not save');
        userRepository.save.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute({
            userId: 'user-1',
            planId: 'plan-new',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });
});
