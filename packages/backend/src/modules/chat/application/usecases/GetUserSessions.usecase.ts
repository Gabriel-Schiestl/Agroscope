import { Inject, Injectable } from '@nestjs/common';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { Exception } from 'src/shared/Exception';
import { Res, Result } from 'src/shared/Result';
import { ChatMessageRepository } from '../../domain/repositories/ChatMessage.repository';

export interface GetUserSessionsParams {
    userId: string;
}

@Injectable()
export class GetUserSessionsUseCase extends AbstractUseCase<
    GetUserSessionsParams,
    Exception,
    string[]
> {
    constructor(
        @Inject('ChatMessageRepository')
        private readonly chatMessageRepository: ChatMessageRepository,
    ) {
        super();
    }

    protected async onExecute({
        userId,
    }: GetUserSessionsParams): Promise<Result<Exception, string[]>> {
        const result =
            await this.chatMessageRepository.getSessionsByUser(userId);
        if (result.isFailure()) {
            return Res.failure(result.error);
        }

        return Res.success(result.value);
    }
}
