import { EventEmitter2 } from '@nestjs/event-emitter';
import { Res } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Plan } from 'src/modules/core/domain/models/Plan';
import { User } from 'src/modules/core/domain/models/User';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { PlanRepository } from 'src/modules/core/domain/repositories/Plan.repository';
import { CreateUserUseCase } from '../CreateUser.usecase';

describe('CreateUserUseCase', () => {
    const freePlanResult = Plan.create({
        type: Plan.FREE_TYPE,
        imageLimit: 10,
        chatLimit: 20,
        features: [],
        featureFlags: [],
        price: 0,
    });
    if (freePlanResult.isFailure()) throw new Error('setup failed');
    const freePlan = freePlanResult.value;

    let userRepository: jest.Mocked<UserRepository>;
    let planRepository: jest.Mocked<PlanRepository>;
    let eventEmitter: jest.Mocked<EventEmitter2>;
    let useCase: CreateUserUseCase;

    beforeEach(() => {
        userRepository = {
            save: jest.fn().mockResolvedValue(Res.success(undefined)),
            getAll: jest.fn(),
            getById: jest.fn(),
            getByEmail: jest
                .fn()
                .mockResolvedValue(Res.failure(new RepositoryNoDataFound('not found'))),
            resetAllLimits: jest.fn(),
        };
        planRepository = {
            getById: jest.fn(),
            getByType: jest.fn().mockResolvedValue(Res.success(freePlan)),
            getAll: jest.fn(),
        };
        eventEmitter = {
            emit: jest.fn(),
        } as unknown as jest.Mocked<EventEmitter2>;
        useCase = new CreateUserUseCase(
            userRepository,
            planRepository,
            '2026-08-01',
            eventEmitter,
        );
    });

    it('should create a user on the free plan and emit user.created', async () => {
        const result = await useCase.execute({
            name: 'Gabriel',
            email: 'gabriel@example.com',
            password: 'Teste@1234',
            acceptedTerms: true,
        } as any);

        expect(result.isSuccess()).toBe(true);
        expect(userRepository.save).toHaveBeenCalled();
        const savedUser = userRepository.save.mock.calls[0][0] as User;
        expect(savedUser.planId).toBe(freePlan.id);
        expect(savedUser.termsVersion).toBe('2026-08-01');

        expect(eventEmitter.emit).toHaveBeenCalledWith('user.created', {
            id: savedUser.id,
            name: 'Gabriel',
            email: 'gabriel@example.com',
            password: 'Teste@1234',
        });
    });

    it('should fail when the email is already registered', async () => {
        userRepository.getByEmail.mockResolvedValue(
            Res.success(
                User.load(
                    {
                        name: 'Existing',
                        email: 'gabriel@example.com',
                        limit: null,
                    },
                    'existing-id',
                ),
            ),
        );

        const result = await useCase.execute({
            name: 'Gabriel',
            email: 'gabriel@example.com',
            password: 'Teste@1234',
            acceptedTerms: true,
        } as any);

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
        expect(userRepository.save).not.toHaveBeenCalled();
        expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should fail when the free plan cannot be found', async () => {
        const planError = new RepositoryNoDataFound('plan not found');
        planRepository.getByType.mockResolvedValue(Res.failure(planError));

        const result = await useCase.execute({
            name: 'Gabriel',
            email: 'gabriel@example.com',
            password: 'Teste@1234',
            acceptedTerms: true,
        } as any);

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(planError);
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when the user entity is invalid', async () => {
        const result = await useCase.execute({
            name: '',
            email: 'gabriel@example.com',
            password: 'Teste@1234',
            acceptedTerms: true,
        } as any);

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate a save failure', async () => {
        const saveError = new RepositoryNoDataFound('could not save');
        userRepository.save.mockResolvedValue(Res.failure(saveError));

        const result = await useCase.execute({
            name: 'Gabriel',
            email: 'gabriel@example.com',
            password: 'Teste@1234',
            acceptedTerms: true,
        } as any);

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(saveError);
        expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
});
