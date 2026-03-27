import { Inject, Injectable } from '@nestjs/common';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { Exception } from 'src/shared/Exception';
import { Res, Result } from 'src/shared/Result';
import { ChatMessageRepository } from '../../domain/repositories/ChatMessage.repository';
import { ChatMessageAppMapper } from '../mappers/ChatMessage.mapper';
import { ChatMessageDto } from '../dto/ChatMessage.dto';

export interface GetChatHistoryParams {
    sessionId: string;
    userId: string;
}

@Injectable()
export class GetChatHistoryUseCase extends AbstractUseCase<
    GetChatHistoryParams,
    Exception,
    ChatMessageDto[]
> {
    constructor(
        @Inject('ChatMessageRepository')
        private readonly chatMessageRepository: ChatMessageRepository,
    ) {
        super();
    }

    protected async onExecute({
        sessionId,
        userId,
    }: GetChatHistoryParams): Promise<Result<Exception, ChatMessageDto[]>> {
        const result = await this.chatMessageRepository.getBySession(
            sessionId,
            userId,
        );
        if (result.isFailure()) {
            return Res.failure(result.error);
        }

        return Res.success(ChatMessageAppMapper.toDtoList(result.value));
    }
}
