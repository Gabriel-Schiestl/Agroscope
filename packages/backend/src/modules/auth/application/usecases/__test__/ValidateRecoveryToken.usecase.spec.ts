import { INVALID_RECOVERY_CODE_MESSAGE } from '../../../domain/models/Authentication';
import { Res } from 'src/shared/Result';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Authentication } from '../../../domain/models/Authentication';
import { AuthenticationRepository } from '../../../domain/repositories/Authentication.repository';
import { ValidateRecoveryTokenUseCase } from '../ValidateRecoveryToken.usecase';

describe('ValidateRecoveryTokenUseCase', () => {
    const buildAuthenticationWithToken = () => {
        const result = Authentication.create({
            email: 'gabriel@example.com',
            password: 'hash',
        });
        if (result.isFailure()) throw new Error('setup failed');
        result.value.setRecoveryToken('token123');
        return result.value;
    };

    let authenticationRepository: jest.Mocked<AuthenticationRepository>;
    let useCase: ValidateRecoveryTokenUseCase;

    beforeEach(() => {
        authenticationRepository = {
            deleteByEmail: jest.fn(),
            findByEmail: jest
                .fn()
                .mockResolvedValue(Res.success(buildAuthenticationWithToken())),
            save: jest.fn(),
        };
        useCase = new ValidateRecoveryTokenUseCase(authenticationRepository);
    });

    it('should succeed for a valid token', async () => {
        const result = await useCase.execute({
            email: 'gabriel@example.com',
            token: 'token123',
        });

        expect(result.isSuccess()).toBe(true);
    });

    it('should fail with the same invalid code message when the email is unknown', async () => {
        authenticationRepository.findByEmail.mockResolvedValue(
            Res.failure(new RepositoryNoDataFound('not found')),
        );

        const result = await useCase.execute({
            email: 'unknown@example.com',
            token: 'token123',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error.message).toBe(
            INVALID_RECOVERY_CODE_MESSAGE,
        );
    });

    it('should fail for an invalid token', async () => {
        const result = await useCase.execute({
            email: 'gabriel@example.com',
            token: 'wrong-token',
        });

        expect(result.isFailure()).toBe(true);
    });
});
