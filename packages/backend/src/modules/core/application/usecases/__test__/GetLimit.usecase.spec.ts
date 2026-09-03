import { Res } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Limit } from '../../../domain/models/Limit';
import { Plan } from '../../../domain/models/Plan';
import { User } from '../../../domain/models/User';
import { UserRepository } from '../../../domain/repositories/User.repository';
import { PlanRepository } from '../../../domain/repositories/Plan.repository';
import { GetLimitUseCase } from '../GetLimit.usecase';

describe('GetLimitUseCase', () => {
    const buildUser = (planId?: string) => {
        const limit = Limit.load(
            { imageRequests: 2, chatRequests: 4 },
            'limit-1',
        );
        return User.load(
            { name: 'Gabriel', email: 'gabriel@example.com', limit, planId },
            'user-1',
        );
    };

    const buildPlan = () => {
        const result = Plan.create({
            type: 'FREE',
            imageLimit: 10,
            chatLimit: 20,
            features: [],
            featureFlags: ['REPORT_GENERATION'],
            price: 0,
        });
        if (result.isFailure()) throw new Error('setup failed');
        return result.value;
    };

    let userRepository: jest.Mocked<UserRepository>;
    let planRepository: jest.Mocked<PlanRepository>;
    let useCase: GetLimitUseCase;

    beforeEach(() => {
        userRepository = {
            save: jest.fn(),
            getAll: jest.fn(),
            getById: jest
                .fn()
                .mockResolvedValue(Res.success(buildUser('plan-1'))),
            getByEmail: jest.fn(),
            resetAllLimits: jest.fn(),
        };
        planRepository = {
            getById: jest.fn().mockResolvedValue(Res.success(buildPlan())),
            getByType: jest.fn(),
            getAll: jest.fn(),
        };
        useCase = new GetLimitUseCase(userRepository, planRepository);
    });

    it('should return the limit DTO combining user usage and plan limits', async () => {
        const result = await useCase.execute({ userId: 'user-1' });

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value).toEqual({
            imageRequests: 2,
            imageLimit: 10,
            chatRequests: 4,
            chatLimit: 20,
            featureFlags: ['REPORT_GENERATION'],
        });
    });

    it('should fail when the user is not found', async () => {
        const error = new RepositoryNoDataFound('user not found');
        userRepository.getById.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute({ userId: 'unknown' });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });

    it('should fail when the user has no active plan', async () => {
        userRepository.getById.mockResolvedValue(
            Res.success(buildUser(undefined)),
        );

        const result = await useCase.execute({ userId: 'user-1' });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
        expect(result.isFailure() && result.error.message).toBe(
            'Usuário sem plano ativo',
        );
    });

    it('should fail when the plan cannot be found', async () => {
        planRepository.getById.mockResolvedValue(
            Res.failure(new RepositoryNoDataFound('plan not found')),
        );

        const result = await useCase.execute({ userId: 'user-1' });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
        expect(result.isFailure() && result.error.message).toBe(
            'Plano não encontrado',
        );
    });
});
