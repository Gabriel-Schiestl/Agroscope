import { ChatMessage } from '../../domain/models/ChatMessage';
import { ChatMessageModel } from '../models/ChatMessage.model';

export class ChatMessageMapper {
    static domainToModel(message: ChatMessage): ChatMessageModel {
        return new ChatMessageModel().setProps({
            id: message.id,
            content: message.content,
            sender: message.sender,
            userId: message.userId,
            sessionId: message.sessionId,
            createdAt: message.createdAt,
        });
    }

    static modelToDomain(model: ChatMessageModel): ChatMessage {
        return ChatMessage.load(
            {
                content: model.content,
                sender: model.sender,
                userId: model.userId,
                sessionId: model.sessionId,
                createdAt: model.createdAt,
            },
            model.id,
        );
    }
}
