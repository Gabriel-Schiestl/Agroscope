import { Res } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Authentication } from '../../../domain/models/Authentication';
import { AuthenticationRepository } from '../../../domain/repositories/Authentication.repository';
import { AuthUserRepository } from '../../../domain/repositories/AuthUser.repository';
import { ProducerService } from 'src/shared/domain/services/Producer.service';
import { PasswordRecoveryUseCase } from '../PasswordRecovery.usecase';

describe('PasswordRecoveryUseCase', () => {
    const buildAuthentication = () => {
        const result = Authentication.create({
            email: 'gabriel@example.com',
            password: 'hash',
        });
        if (result.isFailure()) throw new Error('setup failed');
        return result.value;
    };

    const user = { id: 'user-1', name: 'Gabriel', email: 'gabriel@example.com' };

    let authenticationRepository: jest.Mocked<AuthenticationRepository>;
    let emailService: jest.Mocked<ProducerService>;
    let userRepository: jest.Mocked<AuthUserRepository>;
    let useCase: PasswordRecoveryUseCase;

    beforeEach(() => {
        authenticationRepository = {
            findByEmail: jest
                .fn()
                .mockResolvedValue(Res.success(buildAuthentication())),
            save: jest.fn().mockResolvedValue(Res.success(undefined)),
        };
        emailService = {
            sendMessage: jest.fn(),
        };
        userRepository = {
            getByEmail: jest.fn().mockResolvedValue(Res.success(user)),
            getById: jest.fn(),
        };
        useCase = new PasswordRecoveryUseCase(
            authenticationRepository,
            emailService,
            userRepository,
        );
    });

    it('should generate a recovery token, save it, and send an email', async () => {
        const result = await useCase.execute({
            email: 'gabriel@example.com',
        });

        expect(result.isSuccess()).toBe(true);
        expect(authenticationRepository.save).toHaveBeenCalled();
        const savedAuth = authenticationRepository.save.mock.calls[0][0];
        expect(savedAuth.recoveryCode).toMatch(/^\d{6}$/);

        expect(emailService.sendMessage).toHaveBeenCalledWith(
            'token',
            expect.objectContaining({
                to: 'gabriel@example.com',
                templateId: 6,
                params: expect.objectContaining({
                    name: user.name,
                    token: savedAuth.recoveryCode,
                }),
            }),
        );
    });

    it('should fail when authentication is not found', async () => {
        authenticationRepository.findByEmail.mockResolvedValue(
            Res.failure(new RepositoryNoDataFound('not found')),
        );

        const result = await useCase.execute({
            email: 'unknown@example.com',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            TechnicalException,
        );
        expect(emailService.sendMessage).not.toHaveBeenCalled();
    });

    it('should fail when the user is not found', async () => {
        userRepository.getByEmail.mockResolvedValue(
            Res.failure(new RepositoryNoDataFound('not found')),
        );

        const result = await useCase.execute({
            email: 'gabriel@example.com',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            TechnicalException,
        );
        expect(emailService.sendMessage).not.toHaveBeenCalled();
    });

    it('should fail when saving the authentication fails', async () => {
        authenticationRepository.save.mockResolvedValue(
            Res.failure(new RepositoryNoDataFound('not found')),
        );

        const result = await useCase.execute({
            email: 'gabriel@example.com',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            TechnicalException,
        );
        expect(emailService.sendMessage).not.toHaveBeenCalled();
    });
});
