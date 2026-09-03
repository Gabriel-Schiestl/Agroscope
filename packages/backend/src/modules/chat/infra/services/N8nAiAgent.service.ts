import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import {
    AiAgentPayload,
    AiAgentService,
} from '../../domain/services/AiAgent.service';

@Injectable()
export class N8nAiAgentService implements AiAgentService {
    private readonly logger = new Logger(N8nAiAgentService.name);

    constructor(
        private readonly httpService: HttpService,
        @Inject('N8N_WEBHOOK_URL') private readonly webhookUrl: string,
    ) {}

    async sendMessage(
        payload: AiAgentPayload,
    ): Promise<Result<TechnicalException, string>> {
        if (!this.webhookUrl) {
            return Res.failure(
                new TechnicalException('N8N_WEBHOOK_URL não configurado'),
            );
        }

        try {
            const response = await firstValueFrom(
                this.httpService.post<{ response: string }>(
                    this.webhookUrl,
                    payload,
                ),
            );

            const aiResponse = response.data?.response;
            if (!aiResponse) {
                return Res.failure(
                    new TechnicalException(
                        'Resposta inválida do agente: campo "response" ausente',
                    ),
                );
            }

            return Res.success(aiResponse);
        } catch (e) {
            this.logger.error(
                `Falha ao enviar mensagem ao agente: ${e.message}`,
                e.stack,
            );
            return Res.failure(new TechnicalException(e.message));
        }
    }
}
