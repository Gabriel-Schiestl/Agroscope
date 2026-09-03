import { UnauthorizedException } from '@nestjs/common';
import { Res } from 'src/shared/Result';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Authentication } from '../../../domain/models/Authentication';
import { AuthenticationRepository } from '../../../domain/repositories/Authentication.repository';
import { AuthUserRepository } from '../../../domain/repositories/AuthUser.repository';
import { AuthenticationService } from '../../../domain/services/Authentication.service';
import { EncryptionService } from '../../../domain/services/Encryption.service';
import { AESService } from '../../../domain/services/AES.service';
import { LoginUseCase } from '../Login.usecase';

describe('LoginUseCase', () => {
    const user = {
        id: 'user-1',
        name: 'Gabriel',
        email: 'gabriel@example.com',
    };

    const buildAuthentication = () => {
        const result = Authentication.create({
            email: 'gabriel@example.com',
            password: 'hashed-password',
        });
        if (result.isFailure()) throw new Error('setup failed');
        return result.value;
    };

    let userRepository: jest.Mocked<AuthUserRepository>;
    let authenticationRepository: jest.Mocked<AuthenticationRepository>;
    let authenticationService: jest.Mocked<AuthenticationService>;
    let encryptionService: jest.Mocked<EncryptionService>;
    let aesService: jest.Mocked<AESService>;
    let useCase: LoginUseCase;

    beforeEach(() => {
        userRepository = {
            getByEmail: jest.fn().mockResolvedValue(Res.success(user)),
            getById: jest.fn(),
        };
        authenticationRepository = {
            findByEmail: jest
                .fn()
                .mockResolvedValue(Res.success(buildAuthentication())),
            save: jest.fn().mockResolvedValue(Res.success(undefined)),
        };
        authenticationService = {
            sign: jest.fn().mockResolvedValue('jwt-token'),
            verify: jest.fn(),
        };
        encryptionService = {
            compare: jest.fn().mockResolvedValue(Res.success(undefined)),
            encrypt: jest.fn(),
        };
        aesService = {
            encrypt: jest
                .fn()
                .mockResolvedValue(Res.success('encrypted-token')),
            decrypt: jest.fn(),
        };
        useCase = new LoginUseCase(
            userRepository,
            authenticationRepository,
            authenticationService,
            encryptionService,
            aesService,
        );
    });

    it('should return an encrypted token on successful login', async () => {
        const result = await useCase.execute({
            email: 'gabriel@example.com',
            password: 'plain-password',
        });

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value).toBe('encrypted-token');
        expect(authenticationService.sign).toHaveBeenCalledWith({
            name: user.name,
            email: user.email,
            sub: user.id,
        });
        expect(authenticationRepository.save).toHaveBeenCalled();
    });

    it('should fail when authentication is not found', async () => {
        authenticationRepository.findByEmail.mockResolvedValue(
            Res.failure(new RepositoryNoDataFound('not found')),
        );

        const result = await useCase.execute({
            email: 'unknown@example.com',
            password: 'plain-password',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            UnauthorizedException,
        );
    });

    it('should fail when user is not found', async () => {
        userRepository.getByEmail.mockResolvedValue(
            Res.failure(new RepositoryNoDataFound('not found')),
        );

        const result = await useCase.execute({
            email: 'gabriel@example.com',
            password: 'plain-password',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            UnauthorizedException,
        );
    });

    it('should fail when the account is blocked', async () => {
        const blockedAuth = buildAuthentication();
        for (let i = 0; i < 5; i++) {
            blockedAuth.incrementIncorrectPasswordAttempts();
        }
        authenticationRepository.findByEmail.mockResolvedValue(
            Res.success(blockedAuth),
        );

        const result = await useCase.execute({
            email: 'gabriel@example.com',
            password: 'plain-password',
        });

        expect(result.isFailure()).toBe(true);
        expect(
            result.isFailure() && (result.error as UnauthorizedException).message,
        ).toBe('Account blocked, contact support');
        expect(encryptionService.compare).not.toHaveBeenCalled();
    });

    it('should increment failed attempts and save when password is invalid', async () => {
        encryptionService.compare.mockResolvedValue(
            Res.failure(new BusinessException('nope')),
        );

        const result = await useCase.execute({
            email: 'gabriel@example.com',
            password: 'wrong-password',
        });

        expect(result.isFailure()).toBe(true);
        expect(
            result.isFailure() && (result.error as UnauthorizedException).message,
        ).toBe('Error on login');
        expect(authenticationRepository.save).toHaveBeenCalledTimes(1);
        const savedAuth = authenticationRepository.save.mock
            .calls[0][0] as Authentication;
        expect(savedAuth.incorrectPasswordAttempts).toBe(1);
        expect(authenticationService.sign).not.toHaveBeenCalled();
    });

    it('should fail when saving the authentication after login fails', async () => {
        const technicalError = new RepositoryNoDataFound('not found');
        authenticationRepository.save.mockResolvedValue(
            Res.failure(technicalError),
        );

        const result = await useCase.execute({
            email: 'gabriel@example.com',
            password: 'plain-password',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(technicalError);
    });

    it('should fail when token encryption fails', async () => {
        aesService.encrypt.mockResolvedValue(
            Res.failure(new BusinessException('aes error')),
        );

        const result = await useCase.execute({
            email: 'gabriel@example.com',
            password: 'plain-password',
        });

        expect(result.isFailure()).toBe(true);
        expect(
            result.isFailure() && (result.error as UnauthorizedException).message,
        ).toBe('Error on login');
    });
});
