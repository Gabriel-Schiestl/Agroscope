import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import { Readable } from 'stream';
import { of, throwError } from 'rxjs';
import { PredictServiceImpl } from '../Predict.service';

describe('PredictServiceImpl', () => {
    let httpService: jest.Mocked<HttpService>;
    let service: PredictServiceImpl;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        httpService = {
            post: jest.fn(),
        } as unknown as jest.Mocked<HttpService>;
        service = new PredictServiceImpl(httpService);
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
                        plant: 'Tomate',
                        plantConfidence: 0.9,
                        prediction: 'Requeima',
                        predictionConfidence: 0.8,
                    },
                }) as any,
            );

            const result = await service.predict('/tmp/image.jpg');

            expect(result.isSuccess()).toBe(true);
            expect(result.isSuccess() && result.value.plant).toBe('Tomate');
        });

        it('should fail when the response is incomplete', async () => {
            httpService.post.mockReturnValue(
                of({ data: { plant: 'Tomate' } }) as any,
            );

            const result = await service.predict('/tmp/image.jpg');

            expect(result.isFailure()).toBe(true);
        });

        it('should fail when the request errors out', async () => {
            httpService.post.mockReturnValue(
                throwError(() => new Error('network error')) as any,
            );

            const result = await service.predict('/tmp/image.jpg');

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
