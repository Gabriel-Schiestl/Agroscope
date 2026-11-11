import { Res } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { CreateAuthenticationUseCase } from '../../usecases/CreateAuthentication.usecase';
import { AuthEventListener } from '../AuthEvent.listener';

describe('AuthEventListener', () => {
    let createAuthenticationUseCase: jest.Mocked<CreateAuthenticationUseCase>;
    let authenticationRepository: { deleteByEmail: jest.Mock };
    let listener: AuthEventListener;

    beforeEach(() => {
        authenticationRepository = {
            deleteByEmail: jest.fn().mockResolvedValue(Res.success(undefined)),
        };
        createAuthenticationUseCase = {
            execute: jest.fn().mockResolvedValue(Res.success(undefined)),
        } as unknown as jest.Mocked<CreateAuthenticationUseCase>;
        listener = new AuthEventListener(
            createAuthenticationUseCase,
            authenticationRepository as any,
        );
    });

    it('should create an authentication record for the created user', async () => {
        await listener.handleUserCreated({
            id: 'user-1',
            name: 'Gabriel',
            email: 'gabriel@example.com',
            password: 'plain-password',
        } as any);

        expect(createAuthenticationUseCase.execute).toHaveBeenCalledWith({
            email: 'gabriel@example.com',
            password: 'plain-password',
        });
    });

    it('should throw when creating the authentication fails', async () => {
        const error = new BusinessException('could not create');
        createAuthenticationUseCase.execute.mockResolvedValue(
            Res.failure(error),
        );

        await expect(
            listener.handleUserCreated({
                id: 'user-1',
                name: 'Gabriel',
                email: 'gabriel@example.com',
                password: 'plain-password',
            } as any),
        ).rejects.toBe(error);
    });

    it('should delete the credentials when the user is deleted', async () => {
        await listener.handleUserDeleted({ email: 'gabriel@example.com' });

        expect(authenticationRepository.deleteByEmail).toHaveBeenCalledWith(
            'gabriel@example.com',
        );
    });

    it('should rethrow when the credentials cannot be deleted', async () => {
        const error = new BusinessException('falhou');
        authenticationRepository.deleteByEmail.mockResolvedValue(
            Res.failure(error),
        );

        await expect(
            listener.handleUserDeleted({ email: 'gabriel@example.com' }),
        ).rejects.toBe(error);
    });
});
