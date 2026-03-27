import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';

export interface AiAgentPayload {
    message: string;
    userId: string;
    sessionId: string;
    history: Array<{
        sender: 'human' | 'ai';
        content: string;
        createdAt: Date;
    }>;
}

export interface AiAgentService {
    sendMessage(
        payload: AiAgentPayload,
    ): Promise<Result<TechnicalException, string>>;
}
