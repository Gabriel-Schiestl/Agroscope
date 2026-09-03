import { Res } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { AuthenticationRepository } from '../../../domain/repositories/Authentication.repository';
import { EncryptionService } from '../../../domain/services/Encryption.service';
import { CreateAuthenticationUseCase } from '../CreateAuthentication.usecase';

describe('CreateAuthenticationUseCase', () => {
    let authenticationRepository: jest.Mocked<AuthenticationRepository>;
    let encryptionService: jest.Mocked<EncryptionService>;
    let useCase: CreateAuthenticationUseCase;

    beforeEach(() => {
        authenticationRepository = {
            findByEmail: jest.fn(),
            save: jest.fn().mockResolvedValue(Res.success(undefined)),
        };
        encryptionService = {
            encrypt: jest.fn().mockResolvedValue('hashed-password'),
            compare: jest.fn(),
        };
        useCase = new CreateAuthenticationUseCase(
            authenticationRepository,
            encryptionService,
        );
    });

    it('should hash the password and save the authentication', async () => {
        const result = await useCase.execute({
            email: 'gabriel@example.com',
            password: 'plain-password',
        });

        expect(result.isSuccess()).toBe(true);
        expect(encryptionService.encrypt).toHaveBeenCalledWith(
            'plain-password',
        );
        expect(authenticationRepository.save).toHaveBeenCalled();
        const savedAuth = authenticationRepository.save.mock.calls[0][0];
        expect(savedAuth.password).toBe('hashed-password');
        expect(savedAuth.email).toBe('gabriel@example.com');
    });

    it('should fail when email is missing', async () => {
        const result = await useCase.execute({
            email: '',
            password: 'plain-password',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
        expect(authenticationRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate a repository failure', async () => {
        const repoError = new BusinessException('could not save');
        authenticationRepository.save.mockResolvedValue(
            Res.failure(repoError),
        );

        const result = await useCase.execute({
            email: 'gabriel@example.com',
            password: 'plain-password',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(repoError);
    });
});
