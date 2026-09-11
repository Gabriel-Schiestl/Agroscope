import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import { Readable } from 'stream';
import { of, throwError } from 'rxjs';
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

        it('should send the mapped culture name expected by the IA service', async () => {
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

            expect(appendSpy).toHaveBeenCalledWith('culture', 'Wheat');
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
