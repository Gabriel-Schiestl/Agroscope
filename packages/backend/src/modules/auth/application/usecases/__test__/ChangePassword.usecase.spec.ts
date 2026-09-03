import { Res } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Authentication } from '../../../domain/models/Authentication';
import { AuthenticationRepository } from '../../../domain/repositories/Authentication.repository';
import { EncryptionService } from '../../../domain/services/Encryption.service';
import { ChangePasswordUseCase } from '../ChangePassword.usecase';

describe('ChangePasswordUseCase', () => {
    const buildAuthenticationWithToken = () => {
        const result = Authentication.create({
            email: 'gabriel@example.com',
            password: 'old-hash',
        });
        if (result.isFailure()) throw new Error('setup failed');
        result.value.setRecoveryToken('token123');
        return result.value;
    };

    let authenticationRepository: jest.Mocked<AuthenticationRepository>;
    let encryptionService: jest.Mocked<EncryptionService>;
    let useCase: ChangePasswordUseCase;

    beforeEach(() => {
        authenticationRepository = {
            findByEmail: jest
                .fn()
                .mockResolvedValue(Res.success(buildAuthenticationWithToken())),
            save: jest.fn().mockResolvedValue(Res.success(undefined)),
        };
        encryptionService = {
            encrypt: jest.fn().mockResolvedValue('new-hash'),
            compare: jest.fn(),
        };
        useCase = new ChangePasswordUseCase(
            authenticationRepository,
            encryptionService,
        );
    });

    it('should change the password with a valid token', async () => {
        const result = await useCase.execute({
            email: 'gabriel@example.com',
            newPassword: 'NewPass@123',
            token: 'token123',
        });

        expect(result.isSuccess()).toBe(true);
        expect(encryptionService.encrypt).toHaveBeenCalledWith('NewPass@123');
        expect(authenticationRepository.save).toHaveBeenCalled();
    });

    it('should fail when the authentication is not found', async () => {
        authenticationRepository.findByEmail.mockResolvedValue(
            Res.failure(new RepositoryNoDataFound('not found')),
        );

        const result = await useCase.execute({
            email: 'unknown@example.com',
            newPassword: 'NewPass@123',
            token: 'token123',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            TechnicalException,
        );
    });

    it('should fail with an invalid token', async () => {
        const result = await useCase.execute({
            email: 'gabriel@example.com',
            newPassword: 'NewPass@123',
            token: 'wrong-token',
        });

        expect(result.isFailure()).toBe(true);
    });

    it('should fail when saving the authentication fails', async () => {
        authenticationRepository.save.mockResolvedValue(
            Res.failure(new RepositoryNoDataFound('not found')),
        );

        const result = await useCase.execute({
            email: 'gabriel@example.com',
            newPassword: 'NewPass@123',
            token: 'token123',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            TechnicalException,
        );
    });
});
