import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { ChatMessage } from '../ChatMessage';

describe('ChatMessage Domain', () => {
    const validProps = {
        content: 'Olá, tudo bem?',
        sender: 'human' as const,
        userId: 'user-1',
        sessionId: 'session-1',
    };

    it('should create a chat message successfully', () => {
        const result = ChatMessage.create(validProps);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value).toBeInstanceOf(ChatMessage);
            expect(result.value.content).toBe(validProps.content);
            expect(result.value.sender).toBe('human');
            expect(result.value.userId).toBe('user-1');
            expect(result.value.sessionId).toBe('session-1');
            expect(result.value.createdAt).toBeInstanceOf(Date);
        }
    });

    it('should fail without content', () => {
        const result = ChatMessage.create({ ...validProps, content: '' });
        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should fail without userId', () => {
        const result = ChatMessage.create({ ...validProps, userId: '' });
        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should fail without sessionId', () => {
        const result = ChatMessage.create({ ...validProps, sessionId: '' });
        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should load a chat message with a given id', () => {
        const createdAt = new Date('2026-01-01');
        const message = ChatMessage.load(
            { ...validProps, createdAt },
            'message-1',
        );

        expect(message.id).toBe('message-1');
        expect(message.createdAt).toBe(createdAt);
    });
});
