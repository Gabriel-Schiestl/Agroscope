import { Res } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { Limit } from 'src/modules/core/domain/models/Limit';
import { Plan } from 'src/modules/core/domain/models/Plan';
import { User } from 'src/modules/core/domain/models/User';
import { History } from 'src/modules/core/domain/models/History';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { PlanRepository } from 'src/modules/core/domain/repositories/Plan.repository';
import { HistoryRepository } from 'src/modules/core/domain/repositories/History.repository';
import { ChatMessage } from '../../../domain/models/ChatMessage';
import { ChatMessageRepository } from '../../../domain/repositories/ChatMessage.repository';
import { AiAgentService } from '../../../domain/services/AiAgent.service';
import { SendMessageUseCase } from '../SendMessage.usecase';

describe('SendMessageUseCase', () => {
    const buildUser = (chatRequests = 0) =>
        User.load(
            {
                name: 'Gabriel',
                email: 'gabriel@example.com',
                limit: Limit.load({ imageRequests: 0, chatRequests }, 'limit-1'),
                planId: 'plan-1',
            },
            'user-1',
        );

    const buildPlan = () => {
        const result = Plan.create({
            type: 'FREE',
            imageLimit: 10,
            chatLimit: 5,
            features: [],
            featureFlags: [],
            price: 0,
        });
        if (result.isFailure()) throw new Error('setup failed');
        return result.value;
    };

    const buildPastMessage = (id: string) =>
        ChatMessage.load(
            {
                content: 'mensagem anterior',
                sender: 'human',
                userId: 'user-1',
                sessionId: 'session-1',
                createdAt: new Date('2026-01-01'),
            },
            id,
        );

    let chatMessageRepository: jest.Mocked<ChatMessageRepository>;
    let aiAgentService: jest.Mocked<AiAgentService>;
    let userRepository: jest.Mocked<UserRepository>;
    let planRepository: jest.Mocked<PlanRepository>;
    let historyRepository: jest.Mocked<HistoryRepository>;
    let useCase: SendMessageUseCase;

    beforeEach(() => {
        chatMessageRepository = {
            save: jest.fn().mockResolvedValue(Res.success(undefined)),
            getBySession: jest.fn(),
            getLastBySession: jest
                .fn()
                .mockResolvedValue(Res.success([buildPastMessage('old-1')])),
            getSessionsByUser: jest.fn(),
        };
        aiAgentService = {
            sendMessage: jest
                .fn()
                .mockResolvedValue(Res.success('resposta da IA')),
        };
        userRepository = {
            save: jest.fn().mockResolvedValue(Res.success(undefined)),
            getAll: jest.fn(),
            getById: jest.fn().mockResolvedValue(Res.success(buildUser())),
            getByEmail: jest.fn(),
            resetAllLimits: jest.fn(),
        };
        planRepository = {
            getById: jest.fn().mockResolvedValue(Res.success(buildPlan())),
            getByType: jest.fn(),
            getAll: jest.fn(),
        };
        historyRepository = {
            save: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn().mockResolvedValue(
                Res.failure(new RepositoryNoDataFound('not found')),
            ),
            getByUserId: jest.fn(),
            getAnalyticsByUserId: jest.fn(),
        };
        useCase = new SendMessageUseCase(
            chatMessageRepository,
            aiAgentService,
            10,
            userRepository,
            planRepository,
            historyRepository,
        );
    });

    it('should fail when the user is not found', async () => {
        const error = new RepositoryNoDataFound('not found');
        userRepository.getById.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute({
            content: 'Olá',
            userId: 'unknown',
            sessionId: 'session-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });

    it('should fail when the user has no active plan', async () => {
        userRepository.getById.mockResolvedValue(
            Res.success(
                User.load(
                    { name: 'Gabriel', email: 'g@e.com', limit: Limit.create() },
                    'user-1',
                ),
            ),
        );

        const result = await useCase.execute({
            content: 'Olá',
            userId: 'user-1',
            sessionId: 'session-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should fail when the plan is not found', async () => {
        planRepository.getById.mockResolvedValue(
            Res.failure(new RepositoryNoDataFound('not found')),
        );

        const result = await useCase.execute({
            content: 'Olá',
            userId: 'user-1',
            sessionId: 'session-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should fail when the chat message limit has been reached', async () => {
        userRepository.getById.mockResolvedValue(Res.success(buildUser(5)));

        const result = await useCase.execute({
            content: 'Olá',
            userId: 'user-1',
            sessionId: 'session-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(
            result.isFailure() && (result.error as BusinessException).message,
        ).toContain('Limite de 5 mensagens');
        expect(chatMessageRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when the human message is invalid', async () => {
        const result = await useCase.execute({
            content: '',
            userId: 'user-1',
            sessionId: 'session-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should fail when saving the human message fails', async () => {
        const error = new TechnicalException('save error');
        chatMessageRepository.save.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute({
            content: 'Olá',
            userId: 'user-1',
            sessionId: 'session-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });

    it('should fail when fetching the session history fails', async () => {
        const error = new TechnicalException('history error');
        chatMessageRepository.getLastBySession.mockResolvedValue(
            Res.failure(error),
        );

        const result = await useCase.execute({
            content: 'Olá',
            userId: 'user-1',
            sessionId: 'session-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });

    it('should fail when the AI agent fails to respond', async () => {
        const error = new TechnicalException('ai error');
        aiAgentService.sendMessage.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute({
            content: 'Olá',
            userId: 'user-1',
            sessionId: 'session-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });

    it('should fail when saving the AI message fails', async () => {
        const error = new TechnicalException('save error');
        chatMessageRepository.save
            .mockResolvedValueOnce(Res.success(undefined))
            .mockResolvedValueOnce(Res.failure(error));

        const result = await useCase.execute({
            content: 'Olá',
            userId: 'user-1',
            sessionId: 'session-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });

    it('should fail when saving the updated user fails', async () => {
        const error = new TechnicalException('save error');
        userRepository.save.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute({
            content: 'Olá',
            userId: 'user-1',
            sessionId: 'session-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });

    it('should send the message, save both messages, and increment chat usage', async () => {
        const result = await useCase.execute({
            content: 'Olá',
            userId: 'user-1',
            sessionId: 'session-1',
        });

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value.userMessage.content).toBe(
            'Olá',
        );
        expect(result.isSuccess() && result.value.aiMessage.content).toBe(
            'resposta da IA',
        );
        expect(result.isSuccess() && result.value.aiMessage.sender).toBe(
            'ai',
        );

        expect(chatMessageRepository.save).toHaveBeenCalledTimes(2);

        const savedUser = userRepository.save.mock.calls[0][0] as User;
        expect(savedUser.limit.chatRequests).toBe(1);

        expect(aiAgentService.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Olá',
                userId: 'user-1',
                sessionId: 'session-1',
                analysisContext: undefined,
                history: [
                    expect.objectContaining({
                        sender: 'human',
                        content: 'mensagem anterior',
                    }),
                ],
            }),
        );
    });

    it('should attach the analysis context when a matching history entry is found', async () => {
        const analysis = History.load(
            {
                createdAt: new Date(),
                crop: 'Milho',
                cropConfidence: 0.9,
                sicknessId: 'sickness-1',
                sicknessConfidence: 0.8,
                explanation: 'exp',
                causes: 'causas',
                handling: 'manejo',
                precautions: 'precaucoes',
                image: 'base64',
                userId: 'user-1',
            },
            'session-1',
        );
        historyRepository.getById.mockResolvedValue(Res.success(analysis));

        const result = await useCase.execute({
            content: 'Olá',
            userId: 'user-1',
            sessionId: 'session-1',
        });

        expect(result.isSuccess()).toBe(true);
        expect(aiAgentService.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                analysisContext: expect.objectContaining({
                    crop: 'Milho',
                    cropConfidence: 0.9,
                    handling: 'manejo',
                }),
            }),
        );
    });

    it('should exclude the just-saved human message from the context history', async () => {
        chatMessageRepository.getLastBySession.mockImplementation(
            async () => {
                return Res.success([]);
            },
        );

        const result = await useCase.execute({
            content: 'Olá',
            userId: 'user-1',
            sessionId: 'session-1',
        });

        expect(result.isSuccess()).toBe(true);
        expect(aiAgentService.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ history: [] }),
        );
    });
});
