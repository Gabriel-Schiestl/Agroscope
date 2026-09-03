import * as fs from 'fs';
import { MockPredictService } from '../MockPredict.service';

describe('MockPredictService', () => {
    let service: MockPredictService;
    let randomSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.useFakeTimers();
        service = new MockPredictService();
        randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    });

    afterEach(() => {
        randomSpy.mockRestore();
        jest.useRealTimers();
    });

    describe('predict', () => {
        it('should return a mocked disease prediction after the simulated delay', async () => {
            const promise = service.predict('/tmp/some-image.jpg');
            await jest.advanceTimersByTimeAsync(1000);
            const result = await promise;

            expect(result.isSuccess()).toBe(true);
            expect(result.isSuccess() && result.value.plant).toBe('Tomate');
            expect(result.isSuccess() && result.value.prediction).toBe(
                'Requeima',
            );
        });
    });

    describe('getHandling', () => {
        it('should return the catalogued handling for a known prediction', async () => {
            const promise = service.getHandling('Requeima', 'Tomate');
            await jest.advanceTimersByTimeAsync(1000);
            const result = await promise;

            expect(result.isSuccess()).toBe(true);
            expect(result.isSuccess() && result.value.diagnostico).toContain(
                'Requeima',
            );
        });

        it('should return a generic handling for an uncatalogued prediction', async () => {
            const promise = service.getHandling('Doença Desconhecida', 'Trigo');
            await jest.advanceTimersByTimeAsync(1000);
            const result = await promise;

            expect(result.isSuccess()).toBe(true);
            expect(result.isSuccess() && result.value.diagnostico).toBe(
                'Doença Desconhecida identificada em Trigo.',
            );
        });
    });

    describe('getImageBase64', () => {
        it('should return the base64 content of the image', async () => {
            jest.spyOn(fs.promises, 'readFile').mockResolvedValue(
                'base64-content' as any,
            );

            const result = await service.getImageBase64('/tmp/some-image.jpg');

            expect(result.isSuccess()).toBe(true);
            expect(result.isSuccess() && result.value).toBe('base64-content');
        });

        it('should fail when the file content is empty', async () => {
            jest.spyOn(fs.promises, 'readFile').mockResolvedValue('' as any);

            const result = await service.getImageBase64('/tmp/some-image.jpg');

            expect(result.isFailure()).toBe(true);
        });
    });
});
