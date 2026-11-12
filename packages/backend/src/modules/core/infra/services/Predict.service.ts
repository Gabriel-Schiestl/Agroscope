import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { catchError, firstValueFrom } from 'rxjs';
import { Exception } from 'src/shared/Exception';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { HandlingLlmService } from '../../domain/services/HandlingLlm.service';
import {
    HandlingServiceResponse,
    PredictService,
    PredictServiceResponse,
} from '../../domain/services/Predict.service';
import FormData = require('form-data');

interface IaPredictResponse {
    culture: string;
    expert: {
        predict: string;
        predict_confidence: number;
    };
}

// A triagem da IA recusa fotos que não são de folha ou sem qualidade com 422
// e uma mensagem já pronta para o usuário (ver packages/IA/README.md).
interface IaRejectedResponse {
    status: 'rejected';
    reason: 'not_leaf' | 'low_quality' | 'too_small';
    message: string;
}

const IA_UNAVAILABLE_MESSAGE =
    'Não foi possível analisar a imagem agora. Tente novamente em instantes.';

function invalidImageMessage(data: unknown): string | undefined {
    const detail = (data as { detail?: { reason?: string; message?: string } })
        ?.detail;
    return detail?.reason === 'invalid_image' ? detail.message : undefined;
}

function describeIaError(data: unknown): string {
    if (typeof data === 'string') return data;
    const detail = (data as { detail?: unknown })?.detail ?? data;
    if (typeof detail === 'string') return detail;
    return (detail as { message?: string })?.message ?? JSON.stringify(detail);
}

@Injectable()
export class PredictServiceImpl implements PredictService {
    private readonly logger = new Logger(PredictServiceImpl.name);

    constructor(
        private readonly httpService: HttpService,
        @Inject('HandlingLlmService')
        private readonly handlingLlmService: HandlingLlmService,
    ) {}

    async predict(
        imagePath: string,
        crop: string,
    ): Promise<Result<Exception, PredictServiceResponse>> {
        const formData = new FormData();

        const image = fs.createReadStream(imagePath);

        formData.append('file', image, {
            filename: path.basename(imagePath),
            contentType: 'image/*',
        });
        // A IA aceita o próprio `code` de GET /cultures (ex.: 'SOYBEAN').
        formData.append('culture', crop);

        try {
            const { data } = await firstValueFrom(
                this.httpService
                    .post<IaPredictResponse>(
                        `${process.env.FLASK_API_URL}/predict`,
                        formData,
                        {
                            headers: {
                                ...formData.getHeaders(),
                            },
                        },
                    )
                    .pipe(
                        catchError((error) => {
                            const body = error.response?.data as
                                | IaRejectedResponse
                                | undefined;
                            if (
                                error.response?.status === 422 &&
                                body?.status === 'rejected'
                            ) {
                                throw new BusinessException(body.message);
                            }

                            const invalidImage =
                                error.response?.status === 400
                                    ? invalidImageMessage(error.response.data)
                                    : undefined;
                            if (invalidImage) {
                                throw new BusinessException(invalidImage);
                            }

                            const errorMessage = error.response
                                ? describeIaError(error.response.data)
                                : error.message;
                            console.error(
                                `Erro na requisição: ${errorMessage}`,
                            );
                            throw new Error(
                                `Erro na comunicação com serviço de IA: ${errorMessage}`,
                            );
                        }),
                    ),
            );

            if (
                !data.expert?.predict ||
                data.expert?.predict_confidence === undefined
            ) {
                console.error('Resposta incompleta do serviço de IA:', data);
                return Res.failure(
                    new TechnicalException(
                        'Resposta incompleta do serviço de IA',
                    ),
                );
            }

            return Res.success({
                prediction: data.expert.predict,
                // API de IA retorna a confiança em escala 0-100.
                predictionConfidence: data.expert.predict_confidence / 100,
            });
        } catch (error) {
            if (error instanceof BusinessException) {
                return Res.failure(error);
            }
            console.error('Erro ao processar predição:', error);
            return Res.failure(new TechnicalException(IA_UNAVAILABLE_MESSAGE));
        }
    }

    async getImageBase64(
        imagePath: string,
    ): Promise<Result<TechnicalException, string>> {
        const imageBase64 = await fs.promises.readFile(imagePath, {
            encoding: 'base64',
        });

        if (!imageBase64) {
            return Res.failure(
                new TechnicalException('Error on get image base64'),
            );
        }

        return Res.success(imageBase64);
    }

    async getHandling(
        prediction: string,
        crop: string,
        description?: string,
    ): Promise<Result<TechnicalException, HandlingServiceResponse>> {
        const geminiResult = await this.handlingLlmService.getHandling(
            prediction,
            crop,
            description,
        );
        if (geminiResult.isSuccess()) {
            return geminiResult;
        }

        this.logger.warn(
            `Gemini indisponível para diagnóstico, usando fallback n8n: ${geminiResult.error.message}`,
        );

        return this.getHandlingFromN8n(prediction, crop);
    }

    private async getHandlingFromN8n(
        prediction: string,
        crop: string,
    ): Promise<Result<TechnicalException, HandlingServiceResponse>> {
        try {
            const { data } = await firstValueFrom(
                this.httpService
                    .post<{
                        data: HandlingServiceResponse;
                    }>(`${process.env.HANDLING_API_URL}/handling`, {
                        prediction,
                        crop,
                    })
                    .pipe(
                        catchError((error) => {
                            const errorMessage =
                                error.response?.data || error.message;
                            throw new Error(
                                `Error communicating with handling service: ${errorMessage}`,
                            );
                        }),
                    ),
            );

            if (
                !data.data.diagnostico ||
                !data.data.explicacao ||
                !data.data.causas ||
                !data.data.manejo
            ) {
                console.error('Resposta incompleta do serviço de IA:', data);
                return Res.failure(
                    new TechnicalException(
                        'Resposta incompleta do serviço de IA',
                    ),
                );
            }

            return Res.success(data.data);
        } catch (error) {
            console.error('Error getting handling', error);
            return Res.failure(
                new TechnicalException(
                    `Error getting handling: ${error.message}`,
                ),
            );
        }
    }
}
