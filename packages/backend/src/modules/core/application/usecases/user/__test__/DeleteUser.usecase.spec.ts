import { Res } from 'src/shared/Result';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { User } from 'src/modules/core/domain/models/User';
import { DeleteUserUseCase } from '../DeleteUser.usecase';
import { UpdateUserProfileUseCase } from '../UpdateUserProfile.usecase';

const buildUser = () => {
    const result = User.create({
        name: 'João Silva',
        email: 'joao@gmail.com',
        acceptedTerms: true,
        termsVersion: '2026-08-01',
    });
    if (result.isFailure()) throw result.error;
    return result.value;
};

describe('DeleteUserUseCase', () => {
    let userRepository: any;
    let historyRepository: any;
    let eventEmitter: any;
    let useCase: DeleteUserUseCase;

    beforeEach(() => {
        userRepository = {
            getById: jest.fn(),
            delete: jest.fn().mockResolvedValue(Res.success(undefined)),
        };
        historyRepository = {
            deleteByUserId: jest.fn().mockResolvedValue(Res.success(undefined)),
        };
        eventEmitter = { emitAsync: jest.fn().mockResolvedValue([]) };
        useCase = new DeleteUserUseCase(
            userRepository,
            historyRepository,
            eventEmitter,
        );
    });

    it('deletes history, user and emits user.deleted', async () => {
        const user = buildUser();
        userRepository.getById.mockResolvedValue(Res.success(user));

        const result = await useCase.execute({ userId: user.id });

        expect(result.isSuccess()).toBe(true);
        expect(historyRepository.deleteByUserId).toHaveBeenCalledWith(user.id);
        expect(userRepository.delete).toHaveBeenCalledWith(user.id);
        expect(eventEmitter.emitAsync).toHaveBeenCalledWith('user.deleted', {
            id: user.id,
            email: 'joao@gmail.com',
        });
    });

    it('fails when the user does not exist', async () => {
        userRepository.getById.mockResolvedValue(
            Res.failure(new RepositoryNoDataFound('User not found')),
        );

        const result = await useCase.execute({ userId: 'x' });

        expect(result.isFailure()).toBe(true);
        expect(historyRepository.deleteByUserId).not.toHaveBeenCalled();
        expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });

    it('stops before deleting the user if history deletion fails', async () => {
        userRepository.getById.mockResolvedValue(Res.success(buildUser()));
        historyRepository.deleteByUserId.mockResolvedValue(
            Res.failure(new TechnicalException('db')),
        );

        const result = await useCase.execute({ userId: 'x' });

        expect(result.isFailure()).toBe(true);
        expect(userRepository.delete).not.toHaveBeenCalled();
        expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });
});

describe('UpdateUserProfileUseCase', () => {
    it('updates and formats the name', async () => {
        const user = buildUser();
        const userRepository: any = {
            getById: jest.fn().mockResolvedValue(Res.success(user)),
            save: jest.fn().mockResolvedValue(Res.success(undefined)),
        };
        const useCase = new UpdateUserProfileUseCase(userRepository);

        const result = await useCase.execute({
            userId: user.id,
            name: 'maria da silva',
        });

        expect(result.isSuccess() && result.value).toEqual({
            name: 'Maria da Silva',
            email: 'joao@gmail.com',
        });
        expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it('does not save an invalid name', async () => {
        const userRepository: any = {
            getById: jest.fn().mockResolvedValue(Res.success(buildUser())),
            save: jest.fn(),
        };
        const useCase = new UpdateUserProfileUseCase(userRepository);

        const result = await useCase.execute({ userId: 'x', name: 'a' });

        expect(result.isFailure()).toBe(true);
        expect(userRepository.save).not.toHaveBeenCalled();
    });
});
