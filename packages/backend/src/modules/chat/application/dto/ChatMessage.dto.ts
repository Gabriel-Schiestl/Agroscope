import { IsDate, IsEnum, IsString, IsUUID } from 'class-validator';
import { ChatMessageSender } from '../../domain/models/ChatMessage';

export class ChatMessageDto {
    @IsUUID()
    id: string;

    @IsString()
    content: string;

    @IsEnum(['human', 'ai'])
    sender: ChatMessageSender;

    @IsUUID()
    userId: string;

    @IsString()
    sessionId: string;

    @IsDate()
    createdAt: Date;
}
