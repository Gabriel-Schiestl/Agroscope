import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';

export interface AnalysisContext {
    crop: string;
    cropConfidence: number;
    sickness?: string;
    sicknessConfidence?: number;
    explanation?: string;
    causes?: string;
    handling?: string;
    precautions?: string;
}

export interface AiAgentPayload {
    message: string;
    userId: string;
    sessionId: string;
    analysisContext?: AnalysisContext;
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
