import { Res } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { ChatMessageRepository } from '../../../domain/repositories/ChatMessage.repository';
import { GetUserSessionsUseCase } from '../GetUserSessions.usecase';

describe('GetUserSessionsUseCase', () => {
    let chatMessageRepository: jest.Mocked<ChatMessageRepository>;
    let useCase: GetUserSessionsUseCase;

    beforeEach(() => {
        chatMessageRepository = {
            save: jest.fn(),
            getBySession: jest.fn(),
            getLastBySession: jest.fn(),
            getSessionsByUser: jest
                .fn()
                .mockResolvedValue(Res.success(['session-1', 'session-2'])),
        };
        useCase = new GetUserSessionsUseCase(chatMessageRepository);
    });

    it("should return the user's session ids", async () => {
        const result = await useCase.execute({ userId: 'user-1' });

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value).toEqual([
            'session-1',
            'session-2',
        ]);
    });

    it('should propagate a repository failure', async () => {
        const error = new TechnicalException('db error');
        chatMessageRepository.getSessionsByUser.mockResolvedValue(
            Res.failure(error),
        );

        const result = await useCase.execute({ userId: 'user-1' });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });
});
