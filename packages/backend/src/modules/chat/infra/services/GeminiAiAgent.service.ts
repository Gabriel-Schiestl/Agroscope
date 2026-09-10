import { Inject, Injectable, Logger } from '@nestjs/common';
import { GeminiClientService } from 'src/shared/domain/services/GeminiClient.service';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import {
    AiAgentPayload,
    AiAgentService,
    AnalysisContext,
} from '../../domain/services/AiAgent.service';

@Injectable()
export class GeminiAiAgentService implements AiAgentService {
    private readonly logger = new Logger(GeminiAiAgentService.name);

    constructor(
        @Inject('GeminiClientService')
        private readonly geminiClient: GeminiClientService,
    ) {}

    async sendMessage(
        payload: AiAgentPayload,
    ): Promise<Result<TechnicalException, string>> {
        try {
            const contents = [
                ...payload.history.map((message) => ({
                    role: (message.sender === 'human'
                        ? 'user'
                        : 'model') as 'user' | 'model',
                    text: message.content,
                })),
                { role: 'user' as const, text: payload.message },
            ];

            const text = await this.geminiClient.generateContent({
                systemInstruction: this.buildSystemInstruction(
                    payload.analysisContext,
                ),
                contents,
            });

            if (!text) {
                return Res.failure(
                    new TechnicalException('Resposta vazia do Gemini'),
                );
            }

            return Res.success(text.trim());
        } catch (error) {
            this.logger.warn(
                `Falha ao enviar mensagem ao Gemini: ${error.message}`,
            );
            return Res.failure(new TechnicalException(error.message));
        }
    }

    private buildSystemInstruction(context?: AnalysisContext): string {
        const crop = context?.crop ?? 'Não informado';
        const cropConfidence =
            context?.cropConfidence != null
                ? `${(context.cropConfidence * 100).toFixed(1)}%`
                : 'N/A';
        const sicknessConfidence =
            context?.sicknessConfidence != null
                ? `${(context.sicknessConfidence * 100).toFixed(1)}%`
                : 'N/A';
        const explanation = context?.explanation ?? 'Não disponível';
        const causes = context?.causes ?? 'Não disponível';
        const handling = context?.handling ?? 'Não disponível';
        const precautions = context?.precautions ?? 'Não disponível';

        return `<role>
Você é um assistente virtual especializado em dúvidas sobre diagnóstico e manejo de doenças de plantas.
Você foi acionado a partir de uma análise de imagem realizada pelo usuário e deve responder exclusivamente com base no contexto fornecido.
</role>

<analysis_context>
Cultura identificada: ${crop}
Confiança na cultura: ${cropConfidence}
Confiança no diagnóstico: ${sicknessConfidence}
Explicação: ${explanation}
Causas: ${causes}
Manejo recomendado: ${handling}
Precauções: ${precautions}
</analysis_context>

<rules>
- Use exclusivamente o contexto da análise acima para responder às perguntas do usuário
- Quando perguntado sobre produtos fitossanitários, cite ingredientes ativos reais e específicos (ex: Azoxistrobina, Tebuconazol, Propiconazol), sem citar marcas comerciais
- Não gere novos diagnósticos nem cite alternativas não mencionadas no contexto
- Se a dúvida não puder ser respondida com base no contexto, deixe isso claro
- Linguagem técnica simples, objetiva e amigável
</rules>

Responda apenas com o texto final da resposta ao usuário.
Não utilize JSON, markdown ou explicações adicionais.`;
    }
}
