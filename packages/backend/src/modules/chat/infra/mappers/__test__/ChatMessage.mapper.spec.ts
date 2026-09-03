import { ChatMessage } from '../../../domain/models/ChatMessage';
import { ChatMessageModel } from '../../models/ChatMessage.model';
import { ChatMessageMapper } from '../ChatMessage.mapper';

describe('ChatMessageMapper', () => {
    it('should map a ChatMessage domain entity to a ChatMessageModel', () => {
        const createdAt = new Date('2026-01-01');
        const message = ChatMessage.load(
            {
                content: 'Olá',
                sender: 'ai',
                userId: 'user-1',
                sessionId: 'session-1',
                createdAt,
            },
            'message-1',
        );

        const model = ChatMessageMapper.domainToModel(message);

        expect(model).toBeInstanceOf(ChatMessageModel);
        expect(model.id).toBe('message-1');
        expect(model.content).toBe('Olá');
        expect(model.sender).toBe('ai');
        expect(model.sessionId).toBe('session-1');
    });

    it('should map a ChatMessageModel back to a domain entity', () => {
        const createdAt = new Date('2026-01-01');
        const model = new ChatMessageModel().setProps({
            id: 'message-1',
            content: 'Olá',
            sender: 'human',
            userId: 'user-1',
            sessionId: 'session-1',
            createdAt,
        });

        const message = ChatMessageMapper.modelToDomain(model);

        expect(message).toBeInstanceOf(ChatMessage);
        expect(message.id).toBe('message-1');
        expect(message.sender).toBe('human');
        expect(message.createdAt).toBe(createdAt);
    });
});
