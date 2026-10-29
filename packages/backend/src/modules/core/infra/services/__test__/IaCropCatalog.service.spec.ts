import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { IaCropCatalogService } from '../IaCropCatalog.service';

const IA_CULTURES = {
    data: {
        cultures: [
            {
                culture: 'soybean',
                code: 'SOYBEAN',
                label: 'Soja',
                classes: ['Bacterial_Blight', 'Healthy', 'Rust'],
            },
            {
                culture: 'corn',
                code: 'CORN',
                label: 'Milho',
                classes: ['Healthy', 'Rust_Blight', 'Rust_Common'],
            },
        ],
        unavailable: {},
    },
};

describe('IaCropCatalogService', () => {
    let httpService: jest.Mocked<HttpService>;
    let service: IaCropCatalogService;

    beforeEach(() => {
        process.env.FLASK_API_URL = 'http://ia:5000';
        httpService = { get: jest.fn() } as unknown as jest.Mocked<HttpService>;
        service = new IaCropCatalogService(httpService);
        jest.spyOn(service['logger'], 'log').mockImplementation();
        jest.spyOn(service['logger'], 'warn').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('should read the available crops from the IA /cultures route', async () => {
        httpService.get.mockReturnValue(of(IA_CULTURES) as any);

        const result = await service.getAvailableCrops();

        expect(httpService.get).toHaveBeenCalledWith(
            'http://ia:5000/cultures',
            expect.objectContaining({ timeout: expect.any(Number) }),
        );
        expect(result.isSuccess() && result.value).toEqual([
            {
                code: 'SOYBEAN',
                label: 'Soja',
                classes: ['Bacterial_Blight', 'Healthy', 'Rust'],
            },
            {
                code: 'CORN',
                label: 'Milho',
                classes: ['Healthy', 'Rust_Blight', 'Rust_Common'],
            },
        ]);
    });

    it('should cache the catalog and call the IA again only after the TTL', async () => {
        jest.useFakeTimers();
        httpService.get.mockReturnValue(of(IA_CULTURES) as any);

        await service.getAvailableCrops();
        await service.getAvailableCrops();
        expect(httpService.get).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(5 * 60 * 1000 + 1);
        await service.getAvailableCrops();
        expect(httpService.get).toHaveBeenCalledTimes(2);
    });

    it('should share a single IA call between concurrent requests', async () => {
        httpService.get.mockReturnValue(of(IA_CULTURES) as any);

        await Promise.all([
            service.getAvailableCrops(),
            service.getAvailableCrops(),
            service.getAvailableCrops(),
        ]);

        expect(httpService.get).toHaveBeenCalledTimes(1);
    });

    it('should fail with a friendly message while the IA has never answered (still loading the models)', async () => {
        httpService.get.mockReturnValue(
            throwError(() => new Error('connect ECONNREFUSED')) as any,
        );

        const result = await service.getAvailableCrops();

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error.message).toContain(
            'ainda está iniciando',
        );
    });

    it('should pick up the crops once the IA comes up after the backend', async () => {
        httpService.get
            .mockReturnValueOnce(
                throwError(() => new Error('connect ECONNREFUSED')) as any,
            )
            .mockReturnValueOnce(of(IA_CULTURES) as any);

        service.onApplicationBootstrap();
        const first = await service.getAvailableCrops();
        const second = await service.getAvailableCrops();

        expect(first.isFailure()).toBe(true);
        expect(second.isSuccess() && second.value.map((c) => c.code)).toEqual([
            'SOYBEAN',
            'CORN',
        ]);
    });

    it('should keep the last known catalog when the IA stops answering', async () => {
        jest.useFakeTimers();
        httpService.get
            .mockReturnValueOnce(of(IA_CULTURES) as any)
            .mockReturnValueOnce(throwError(() => new Error('timeout')) as any);

        await service.getAvailableCrops();
        jest.advanceTimersByTime(5 * 60 * 1000 + 1);
        const result = await service.getAvailableCrops();

        expect(httpService.get).toHaveBeenCalledTimes(2);
        expect(result.isSuccess() && result.value).toHaveLength(2);
    });

    it('should ignore entries without a code and fall back to the code as label', async () => {
        httpService.get.mockReturnValue(
            of({
                data: {
                    cultures: [
                        { culture: 'legacy' },
                        { code: 'rice', classes: ['Healthy'] },
                    ],
                },
            }) as any,
        );

        const result = await service.getAvailableCrops();

        expect(result.isSuccess() && result.value).toEqual([
            { code: 'RICE', label: 'rice', classes: ['Healthy'] },
        ]);
    });
});
