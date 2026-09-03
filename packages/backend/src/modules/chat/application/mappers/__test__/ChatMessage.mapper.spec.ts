import { ChatMessage } from '../../../domain/models/ChatMessage';
import { ChatMessageAppMapper } from '../ChatMessage.mapper';

describe('ChatMessageAppMapper', () => {
    const createdAt = new Date('2026-01-01');
    const message = ChatMessage.load(
        {
            content: 'Olá',
            sender: 'human',
            userId: 'user-1',
            sessionId: 'session-1',
            createdAt,
        },
        'message-1',
    );

    it('should map a single ChatMessage to a DTO', () => {
        const dto = ChatMessageAppMapper.toDto(message);

        expect(dto.id).toBe('message-1');
        expect(dto.content).toBe('Olá');
        expect(dto.sender).toBe('human');
        expect(dto.userId).toBe('user-1');
        expect(dto.sessionId).toBe('session-1');
        expect(dto.createdAt).toBe(createdAt);
    });

    it('should map a list of ChatMessages to DTOs', () => {
        const dtos = ChatMessageAppMapper.toDtoList([message, message]);
        expect(dtos).toHaveLength(2);
        expect(dtos[0].id).toBe('message-1');
    });
});
