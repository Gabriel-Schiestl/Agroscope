import { Inject, Injectable, Logger } from '@nestjs/common';
import { GeminiClientService } from 'src/shared/domain/services/GeminiClient.service';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { HandlingLlmService } from '../../domain/services/HandlingLlm.service';
import { HandlingServiceResponse } from '../../domain/services/Predict.service';

const HANDLING_SYSTEM_PROMPT = `Você é um especialista em fitopatologia e manejo de culturas agrícolas.
Receberá apenas o nome de uma doença, sintoma ou distúrbio relatado pelo usuário.

Sua tarefa é:
1) Identificar se o termo se refere a uma doença, praga ou distúrbio fisiológico.
2) Fornecer um diagnóstico provável, mesmo que haja incerteza.
3) Explicar tecnicamente de forma clara, objetiva e acessível.
4) Indicar as principais causas associadas.
5) Sugerir recomendações básicas de manejo integrado, aplicáveis a campo.

Caso o nome seja genérico, ambíguo ou insuficiente, deixe isso claro no diagnóstico.
Não invente informações específicas que não possam ser inferidas apenas pelo nome da doença.

Use linguagem técnica simples e direta. Não cite marcas comerciais nem dosagens químicas.`;

const HANDLING_RESPONSE_SCHEMA = {
    type: 'object',
    properties: {
        diagnostico: { type: 'string' },
        explicacao: { type: 'string' },
        sintomas: { type: 'string' },
        causas: { type: 'string' },
        manejo: { type: 'string' },
    },
    required: ['diagnostico', 'explicacao', 'causas', 'manejo'],
};

@Injectable()
export class GeminiHandlingService implements HandlingLlmService {
    private readonly logger = new Logger(GeminiHandlingService.name);

    constructor(
        @Inject('GeminiClientService')
        private readonly geminiClient: GeminiClientService,
    ) {}

    async getHandling(
        prediction: string,
        crop: string,
    ): Promise<Result<TechnicalException, HandlingServiceResponse>> {
        try {
            const text = await this.geminiClient.generateContent({
                systemInstruction: HANDLING_SYSTEM_PROMPT,
                contents: [
                    {
                        role: 'user',
                        text: `Nome informado: ${prediction}\nPlanta: ${crop}`,
                    },
                ],
                responseSchema: HANDLING_RESPONSE_SCHEMA,
            });

            const parsed = JSON.parse(text) as HandlingServiceResponse;

            if (
                !parsed.diagnostico ||
                !parsed.explicacao ||
                !parsed.causas ||
                !parsed.manejo
            ) {
                return Res.failure(
                    new TechnicalException(
                        'Resposta incompleta do Gemini',
                    ),
                );
            }

            return Res.success(parsed);
        } catch (error) {
            this.logger.warn(
                `Falha ao obter diagnóstico via Gemini: ${error.message}`,
            );
            return Res.failure(new TechnicalException(error.message));
        }
    }
}
