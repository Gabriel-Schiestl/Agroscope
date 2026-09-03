import { Res } from 'src/shared/Result';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { UserRepository } from '../../../domain/repositories/User.repository';
import { ResetLimitsUseCase } from '../ResetLimits.usecase';

describe('ResetLimitsUseCase', () => {
    let userRepository: jest.Mocked<UserRepository>;
    let useCase: ResetLimitsUseCase;

    beforeEach(() => {
        userRepository = {
            save: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn(),
            getByEmail: jest.fn(),
            resetAllLimits: jest.fn().mockResolvedValue(Res.success(undefined)),
        };
        useCase = new ResetLimitsUseCase(userRepository);
    });

    it('should reset all limits', async () => {
        const result = await useCase.execute();

        expect(result.isSuccess()).toBe(true);
        expect(userRepository.resetAllLimits).toHaveBeenCalled();
    });

    it('should propagate a repository failure', async () => {
        const error = new RepositoryNoDataFound('could not reset');
        userRepository.resetAllLimits.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute();

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });
});
