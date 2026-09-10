import { Injectable, Logger } from '@nestjs/common';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import {
    AiAgentPayload,
    AiAgentService,
} from '../../domain/services/AiAgent.service';
import { GeminiAiAgentService } from './GeminiAiAgent.service';
import { N8nAiAgentService } from './N8nAiAgent.service';

@Injectable()
export class FallbackAiAgentService implements AiAgentService {
    private readonly logger = new Logger(FallbackAiAgentService.name);

    constructor(
        private readonly geminiAiAgentService: GeminiAiAgentService,
        private readonly n8nAiAgentService: N8nAiAgentService,
    ) {}

    async sendMessage(
        payload: AiAgentPayload,
    ): Promise<Result<TechnicalException, string>> {
        const geminiResult =
            await this.geminiAiAgentService.sendMessage(payload);
        if (geminiResult.isSuccess()) {
            return geminiResult;
        }

        this.logger.warn(
            `Gemini indisponível para chat, usando fallback n8n: ${geminiResult.error.message}`,
        );

        return this.n8nAiAgentService.sendMessage(payload);
    }
}
