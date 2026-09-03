import { Injectable, Logger } from '@nestjs/common';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import {
    AiAgentPayload,
    AiAgentService,
} from '../../domain/services/AiAgent.service';

@Injectable()
export class MockAiAgentService implements AiAgentService {
    private readonly logger = new Logger(MockAiAgentService.name);

    async sendMessage(
        payload: AiAgentPayload,
    ): Promise<Result<TechnicalException, string>> {
        await this.simulateDelay();

        this.logger.debug(`[MOCK] Mensagem recebida: "${payload.message}"`);

        return Res.success(this.buildReply(payload));
    }

    private buildReply(payload: AiAgentPayload): string {
        const { message, analysisContext } = payload;
        const normalized = this.normalize(message);

        if (!analysisContext) {
            return 'Ainda não encontrei uma análise associada a esta conversa. Envie uma foto da planta para eu poder falar sobre causas, manejo e cuidados (resposta mockada).';
        }

        const { crop, sickness, causes, handling, precautions, explanation } =
            analysisContext;

        if (
            this.matches(normalized, ['causa', 'porque', 'por que', 'motivo'])
        ) {
            return causes
                ? `As principais causas identificadas foram: ${causes} (resposta mockada)`
                : 'Não há causas registradas para esta análise (resposta mockada).';
        }

        if (
            this.matches(normalized, [
                'manejo',
                'tratamento',
                'tratar',
                'como faco',
                'como fazer',
                'resolver',
            ])
        ) {
            return handling
                ? `Para o manejo, recomendo: ${handling} (resposta mockada)`
                : 'Não há recomendações de manejo registradas para esta análise (resposta mockada).';
        }

        if (
            this.matches(normalized, [
                'precau',
                'prevenir',
                'evitar',
                'cuidado',
            ])
        ) {
            return precautions
                ? `Precauções recomendadas: ${precautions} (resposta mockada)`
                : 'Não há precauções específicas registradas para esta análise (resposta mockada).';
        }

        if (
            this.matches(normalized, [
                'diagnostico',
                'explica',
                'o que e',
                'o que ela',
                'doenca',
            ])
        ) {
            return explanation
                ? `${explanation} (resposta mockada)`
                : `Identificamos ${sickness ?? 'uma possível doença'} na cultura de ${crop} (resposta mockada).`;
        }

        return `Sobre a análise da sua ${crop}${
            sickness ? ` (${sickness})` : ''
        }: posso te contar sobre causas, manejo ou precauções — é só perguntar (resposta mockada).`;
    }

    private matches(normalizedMessage: string, keywords: string[]): boolean {
        return keywords.some((keyword) => normalizedMessage.includes(keyword));
    }

    private normalize(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '');
    }

    private simulateDelay(): Promise<void> {
        const ms = 300 + Math.random() * 500;
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
