import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { OpenMeteoWeatherService } from '../OpenMeteoWeather.service';

describe('OpenMeteoWeatherService', () => {
    let httpService: jest.Mocked<HttpService>;
    let service: OpenMeteoWeatherService;

    beforeEach(() => {
        httpService = {
            get: jest.fn(),
        } as unknown as jest.Mocked<HttpService>;
        service = new OpenMeteoWeatherService(
            httpService,
            'https://api.open-meteo.com/v1/forecast',
        );
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should return the current weather on a successful request', async () => {
        httpService.get.mockReturnValue(
            of({
                data: {
                    current: {
                        temperature_2m: 28.5,
                        relative_humidity_2m: 70,
                    },
                },
            }) as any,
        );

        const result = await service.getCurrentWeather({
            latitude: -23.5,
            longitude: -46.6,
        });

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value.temperature).toBe(28.5);
        expect(result.isSuccess() && result.value.humidity).toBe(70);
        expect(httpService.get).toHaveBeenCalledWith(
            'https://api.open-meteo.com/v1/forecast',
            expect.objectContaining({
                params: expect.objectContaining({
                    latitude: -23.5,
                    longitude: -46.6,
                }),
            }),
        );
    });

    it.each([
        ['2026-01-15', 'summer'],
        ['2026-04-15', 'autumn'],
        ['2026-07-15', 'winter'],
        ['2026-10-15', 'spring'],
    ])('should resolve %s to season %s', async (date, expectedSeason) => {
        jest.useFakeTimers().setSystemTime(new Date(date));
        httpService.get.mockReturnValue(
            of({
                data: {
                    current: { temperature_2m: 20, relative_humidity_2m: 50 },
                },
            }) as any,
        );

        const result = await service.getCurrentWeather({
            latitude: -23.5,
            longitude: -46.6,
        });

        expect(result.isSuccess() && result.value.season).toBe(
            expectedSeason,
        );
    });

    it('should return a TechnicalException when the request fails', async () => {
        httpService.get.mockReturnValue(
            throwError(() => new Error('network error')) as any,
        );

        const result = await service.getCurrentWeather({
            latitude: -23.5,
            longitude: -46.6,
        });

        expect(result.isFailure()).toBe(true);
    });
});
