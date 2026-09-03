import { Res } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { ChatMessage } from '../../../domain/models/ChatMessage';
import { ChatMessageRepository } from '../../../domain/repositories/ChatMessage.repository';
import { GetChatHistoryUseCase } from '../GetChatHistory.usecase';

describe('GetChatHistoryUseCase', () => {
    const message = ChatMessage.create({
        content: 'Olá',
        sender: 'human',
        userId: 'user-1',
        sessionId: 'session-1',
    });
    if (message.isFailure()) throw new Error('setup failed');

    let chatMessageRepository: jest.Mocked<ChatMessageRepository>;
    let useCase: GetChatHistoryUseCase;

    beforeEach(() => {
        chatMessageRepository = {
            save: jest.fn(),
            getBySession: jest
                .fn()
                .mockResolvedValue(Res.success([message.value])),
            getLastBySession: jest.fn(),
            getSessionsByUser: jest.fn(),
        };
        useCase = new GetChatHistoryUseCase(chatMessageRepository);
    });

    it('should return the session history mapped to DTOs', async () => {
        const result = await useCase.execute({
            sessionId: 'session-1',
            userId: 'user-1',
        });

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value).toHaveLength(1);
        expect(result.isSuccess() && result.value[0].content).toBe('Olá');
    });

    it('should propagate a repository failure', async () => {
        const error = new TechnicalException('db error');
        chatMessageRepository.getBySession.mockResolvedValue(
            Res.failure(error),
        );

        const result = await useCase.execute({
            sessionId: 'session-1',
            userId: 'user-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });
});
