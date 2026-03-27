import { ChatMessage } from '../../domain/models/ChatMessage';
import { ChatMessageDto } from '../dto/ChatMessage.dto';

export class ChatMessageAppMapper {
    static toDto(message: ChatMessage): ChatMessageDto {
        const dto = new ChatMessageDto();
        dto.id = message.id;
        dto.content = message.content;
        dto.sender = message.sender;
        dto.userId = message.userId;
        dto.sessionId = message.sessionId;
        dto.createdAt = message.createdAt;
        return dto;
    }

    static toDtoList(messages: ChatMessage[]): ChatMessageDto[] {
        return messages.map((m) => this.toDto(m));
    }
}
