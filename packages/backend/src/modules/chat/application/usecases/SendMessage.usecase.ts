import { Inject, Injectable } from '@nestjs/common';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { Exception } from 'src/shared/Exception';
import { Res, Result } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { ChatMessage } from '../../domain/models/ChatMessage';
import { ChatMessageRepository } from '../../domain/repositories/ChatMessage.repository';
import { ChatMessageAppMapper } from '../mappers/ChatMessage.mapper';
import { ChatMessageDto } from '../dto/ChatMessage.dto';
import { AiAgentService } from '../../domain/services/AiAgent.service';

export interface SendMessageProps {
    content: string;
    userId: string;
    sessionId: string;
}

export interface SendMessageResult {
    userMessage: ChatMessageDto;
    aiMessage: ChatMessageDto;
}

@Injectable()
export class SendMessageUseCase extends AbstractUseCase<
    SendMessageProps,
    Exception,
    SendMessageResult
> {
    constructor(
        @Inject('ChatMessageRepository')
        private readonly chatMessageRepository: ChatMessageRepository,
        @Inject('AiAgentService')
        private readonly aiAgentService: AiAgentService,
        @Inject('HISTORY_CONTEXT_LIMIT')
        private readonly historyContextLimit: number,
    ) {
        super();
    }

    protected async onExecute({
        content,
        userId,
        sessionId,
    }: SendMessageProps): Promise<Result<Exception, SendMessageResult>> {
        const humanMessageResult = ChatMessage.create({
            content,
            sender: 'human',
            userId,
            sessionId,
        });
        if (humanMessageResult.isFailure()) {
            return Res.failure(humanMessageResult.error);
        }

        const humanMessage = humanMessageResult.value;

        const saveResult = await this.chatMessageRepository.save(humanMessage);
        if (saveResult.isFailure()) {
            return Res.failure(saveResult.error);
        }

        const historyResult = await this.chatMessageRepository.getLastBySession(
            sessionId,
            userId,
            this.historyContextLimit,
        );
        if (historyResult.isFailure()) {
            return Res.failure(historyResult.error);
        }

        const history = historyResult.value
            .filter((m) => m.id !== humanMessage.id)
            .map((m) => ({
                sender: m.sender,
                content: m.content,
                createdAt: m.createdAt,
            }));

        const webhookResult = await this.aiAgentService.sendMessage({
            message: content,
            userId,
            sessionId,
            history,
        });
        if (webhookResult.isFailure()) {
            return Res.failure(webhookResult.error);
        }

        const aiMessageResult = ChatMessage.create({
            content: webhookResult.value,
            sender: 'ai',
            userId,
            sessionId,
        });
        if (aiMessageResult.isFailure()) {
            return Res.failure(aiMessageResult.error);
        }

        const aiMessage = aiMessageResult.value;

        const saveAiResult = await this.chatMessageRepository.save(aiMessage);
        if (saveAiResult.isFailure()) {
            return Res.failure(saveAiResult.error);
        }

        return Res.success({
            userMessage: ChatMessageAppMapper.toDto(humanMessage),
            aiMessage: ChatMessageAppMapper.toDto(aiMessage),
        });
    }
}
