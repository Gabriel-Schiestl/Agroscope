import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { catchError, firstValueFrom } from 'rxjs';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import {
    HandlingServiceResponse,
    PredictService,
    PredictServiceResponse,
} from '../../domain/services/Predict.service';
import FormData = require('form-data');

@Injectable()
export class PredictServiceImpl implements PredictService {
    constructor(private readonly httpService: HttpService) {}

    async predict(
        imagePath: string,
    ): Promise<Result<TechnicalException, PredictServiceResponse>> {
        const formData = new FormData();

        const image = fs.createReadStream(imagePath);

        formData.append('image', image, {
            filename: path.basename(imagePath),
            contentType: 'image/*',
        });

        try {
            const { data } = await firstValueFrom(
                this.httpService
                    .post<PredictServiceResponse>(
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
                            const errorMessage =
                                error.response?.data || error.message;
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
                !data.plant ||
                !data.prediction ||
                data.plantConfidence === undefined ||
                data.predictionConfidence === undefined
            ) {
                console.error('Resposta incompleta do serviço de IA:', data);
                return Res.failure(
                    new TechnicalException(
                        'Resposta incompleta do serviço de IA',
                    ),
                );
            } else {
                return Res.success(data);
            }
        } catch (error) {
            console.error('Erro ao processar predição:', error);
            return Res.failure(
                new TechnicalException(`Erro na predição: ${error.message}`),
            );
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
