import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import { Readable } from 'stream';
import { of, throwError } from 'rxjs';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res } from 'src/shared/Result';
import { HandlingLlmService } from '../../../domain/services/HandlingLlm.service';
import { PredictServiceImpl } from '../Predict.service';
import FormData = require('form-data');

describe('PredictServiceImpl', () => {
    let httpService: jest.Mocked<HttpService>;
    let handlingLlmService: jest.Mocked<HandlingLlmService>;
    let service: PredictServiceImpl;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        httpService = {
            post: jest.fn(),
        } as unknown as jest.Mocked<HttpService>;
        handlingLlmService = {
            getHandling: jest
                .fn()
                .mockResolvedValue(
                    Res.failure(new TechnicalException('gemini indisponível')),
                ),
        };
        service = new PredictServiceImpl(httpService, handlingLlmService);
        jest.spyOn(fs, 'createReadStream').mockReturnValue(
            Readable.from(Buffer.from('fake-image')) as any,
        );
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('predict', () => {
        it('should return the prediction on a complete response', async () => {
            httpService.post.mockReturnValue(
                of({
                    data: {
                        culture: 'Soybean',
                        expert: {
                            predict: 'Requeima',
                            predict_confidence: 80,
                        },
                    },
                }) as any,
            );

            const result = await service.predict('/tmp/image.jpg', 'SOYBEAN');

            expect(result.isSuccess()).toBe(true);
            expect(result.isSuccess() && result.value.prediction).toBe(
                'Requeima',
            );
            expect(
                result.isSuccess() && result.value.predictionConfidence,
            ).toBe(0.8);
        });

        it('should send the crop code as returned by the IA /cultures route', async () => {
            httpService.post.mockReturnValue(
                of({
                    data: {
                        culture: 'Wheat',
                        expert: { predict: 'Healthy', predict_confidence: 95 },
                    },
                }) as any,
            );
            const appendSpy = jest.spyOn(FormData.prototype, 'append');

            await service.predict('/tmp/image.jpg', 'WHEAT');

            expect(appendSpy).toHaveBeenCalledWith('culture', 'WHEAT');
        });

        it('should fail when the response is incomplete', async () => {
            httpService.post.mockReturnValue(
                of({ data: { culture: 'Tomato' } }) as any,
            );

            const result = await service.predict('/tmp/image.jpg', 'SOYBEAN');

            expect(result.isFailure()).toBe(true);
        });

        it('should fail when the request errors out', async () => {
            httpService.post.mockReturnValue(
                throwError(() => new Error('network error')) as any,
            );

            const result = await service.predict('/tmp/image.jpg', 'SOYBEAN');

            expect(result.isFailure()).toBe(true);
        });

        it('should return a business failure with the IA message when the gate rejects the image', async () => {
            const message =
                'A imagem não parece ser de uma folha. Envie uma foto de uma folha da planta.';
            httpService.post.mockReturnValue(
                throwError(() => ({
                    message: 'Request failed with status code 422',
                    response: {
                        status: 422,
                        data: {
                            status: 'rejected',
                            reason: 'not_leaf',
                            message,
                        },
                    },
                })) as any,
            );

            const result = await service.predict('/tmp/image.jpg', 'SOYBEAN');

            expect(result.isFailure()).toBe(true);
            expect(result.isFailure() && result.error).toBeInstanceOf(
                BusinessException,
            );
            expect(result.isFailure() && result.error.message).toBe(message);
        });

        it('should return the IA message as a business failure when the file cannot be read', async () => {
            httpService.post.mockReturnValue(
                throwError(() => ({
                    message: 'Request failed with status code 400',
                    response: {
                        status: 400,
                        data: {
                            detail: {
                                reason: 'invalid_image',
                                message:
                                    'Não foi possível ler o arquivo. Envie uma imagem válida em JPG, PNG ou WEBP.',
                            },
                        },
                    },
                })) as any,
            );

            const result = await service.predict('/tmp/image.jpg', 'CORN');

            expect(result.isFailure() && result.error).toBeInstanceOf(
                BusinessException,
            );
            expect(result.isFailure() && result.error.message).toBe(
                'Não foi possível ler o arquivo. Envie uma imagem válida em JPG, PNG ou WEBP.',
            );
        });

        it('should hide technical IA details from the user on unexpected errors', async () => {
            httpService.post.mockReturnValue(
                throwError(() => ({
                    message: 'Request failed with status code 400',
                    response: {
                        status: 400,
                        data: {
                            detail: {
                                message: "Cultura 'CORN' não disponível.",
                                available: ['coffee'],
                            },
                        },
                    },
                })) as any,
            );

            const result = await service.predict('/tmp/image.jpg', 'CORN');

            expect(result.isFailure()).toBe(true);
            expect(result.isFailure() && result.error).toBeInstanceOf(
                TechnicalException,
            );
            expect(result.isFailure() && result.error.message).toBe(
                'Não foi possível analisar a imagem agora. Tente novamente em instantes.',
            );
        });
    });

    describe('getImageBase64', () => {
        it('should return the base64 content of the image', async () => {
            jest.spyOn(fs.promises, 'readFile').mockResolvedValue(
                'base64-content' as any,
            );

            const result = await service.getImageBase64('/tmp/image.jpg');

            expect(result.isSuccess()).toBe(true);
            expect(result.isSuccess() && result.value).toBe('base64-content');
        });

        it('should fail when the file content is empty', async () => {
            jest.spyOn(fs.promises, 'readFile').mockResolvedValue('' as any);

            const result = await service.getImageBase64('/tmp/image.jpg');

            expect(result.isFailure()).toBe(true);
        });
    });

    describe('getHandling', () => {
        it('should return the Gemini result without calling n8n when Gemini succeeds', async () => {
            handlingLlmService.getHandling.mockResolvedValue(
                Res.success({
                    diagnostico: 'diag-gemini',
                    explicacao: 'exp-gemini',
                    causas: 'causas-gemini',
                    manejo: 'manejo-gemini',
                }),
            );

            const result = await service.getHandling('Requeima', 'Tomate');

            expect(result.isSuccess()).toBe(true);
            expect(result.isSuccess() && result.value.diagnostico).toBe(
                'diag-gemini',
            );
            expect(httpService.post).not.toHaveBeenCalled();
        });

        it('should fall back to n8n when Gemini fails', async () => {
            httpService.post.mockReturnValue(
                of({
                    data: {
                        data: {
                            diagnostico: 'diag',
                            explicacao: 'exp',
                            causas: 'causas',
                            manejo: 'manejo',
                        },
                    },
                }) as any,
            );

            const result = await service.getHandling('Requeima', 'Tomate');

            expect(result.isSuccess()).toBe(true);
            expect(result.isSuccess() && result.value.diagnostico).toBe(
                'diag',
            );
            expect(httpService.post).toHaveBeenCalled();
        });

        it('should return the handling data on a complete response', async () => {
            httpService.post.mockReturnValue(
                of({
                    data: {
                        data: {
                            diagnostico: 'diag',
                            explicacao: 'exp',
                            causas: 'causas',
                            manejo: 'manejo',
                        },
                    },
                }) as any,
            );

            const result = await service.getHandling('Requeima', 'Tomate');

            expect(result.isSuccess()).toBe(true);
            expect(result.isSuccess() && result.value.diagnostico).toBe(
                'diag',
            );
        });

        it('should fail when the response is incomplete', async () => {
            httpService.post.mockReturnValue(
                of({ data: { data: { diagnostico: 'diag' } } }) as any,
            );

            const result = await service.getHandling('Requeima', 'Tomate');

            expect(result.isFailure()).toBe(true);
        });

        it('should fail when the request errors out', async () => {
            httpService.post.mockReturnValue(
                throwError(() => new Error('network error')) as any,
            );

            const result = await service.getHandling('Requeima', 'Tomate');

            expect(result.isFailure()).toBe(true);
        });
    });
});
