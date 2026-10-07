import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { OpenMeteoWeatherService } from '../OpenMeteoWeather.service';

describe('OpenMeteoWeatherService', () => {
    let httpService: jest.Mocked<HttpService>;
    let service: OpenMeteoWeatherService;

    const hourlyResponse = (
        time: string[],
        temperature: (number | null)[],
        humidity: (number | null)[],
    ) =>
        of({
            data: {
                hourly: {
                    time,
                    temperature_2m: temperature,
                    relative_humidity_2m: humidity,
                },
            },
        }) as any;

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

    it('should average the past hours of the last 7 days', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2026-09-29T12:30:00Z'));
        httpService.get.mockReturnValue(
            hourlyResponse(
                [
                    '2026-09-22T00:00',
                    '2026-09-25T06:00',
                    '2026-09-29T12:00',
                    // previsão (futuro): não entra na média
                    '2026-09-29T13:00',
                ],
                [20, 24, 28, 40],
                [60, 70, 80, 10],
            ),
        );

        const result = await service.getRecentWeather({
            latitude: -23.5,
            longitude: -46.6,
        });

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value.temperature).toBe(24);
        expect(result.isSuccess() && result.value.humidity).toBe(70);
        expect(httpService.get).toHaveBeenCalledWith(
            'https://api.open-meteo.com/v1/forecast',
            expect.objectContaining({
                params: expect.objectContaining({
                    latitude: -23.5,
                    longitude: -46.6,
                    hourly: 'temperature_2m,relative_humidity_2m',
                    past_days: 7,
                }),
            }),
        );
    });

    it('should ignore null readings', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2026-09-29T12:30:00Z'));
        httpService.get.mockReturnValue(
            hourlyResponse(
                ['2026-09-28T00:00', '2026-09-28T01:00'],
                [null, 22],
                [90, null],
            ),
        );

        const result = await service.getRecentWeather({
            latitude: -23.5,
            longitude: -46.6,
        });

        expect(result.isSuccess() && result.value.temperature).toBe(22);
        expect(result.isSuccess() && result.value.humidity).toBe(90);
    });

    it('should fail when there is no reading in the period', async () => {
        httpService.get.mockReturnValue(hourlyResponse([], [], []));

        const result = await service.getRecentWeather({
            latitude: -23.5,
            longitude: -46.6,
        });

        expect(result.isFailure()).toBe(true);
    });

    it.each([
        ['2026-01-15', -23.5, 'summer'],
        ['2026-04-15', -23.5, 'autumn'],
        ['2026-07-15', -23.5, 'winter'],
        ['2026-10-15', -23.5, 'spring'],
        ['2026-01-15', 40.7, 'winter'],
        ['2026-07-15', 40.7, 'summer'],
    ])(
        'should resolve %s at latitude %d to season %s',
        async (date, latitude, expectedSeason) => {
            jest.useFakeTimers().setSystemTime(new Date(date));
            httpService.get.mockReturnValue(
                hourlyResponse(['2020-01-01T00:00'], [20], [50]),
            );

            const result = await service.getRecentWeather({
                latitude,
                longitude: -46.6,
            });

            expect(result.isSuccess() && result.value.season).toBe(
                expectedSeason,
            );
        },
    );

    it('should return a TechnicalException when the request fails', async () => {
        httpService.get.mockReturnValue(
            throwError(() => new Error('network error')) as any,
        );

        const result = await service.getRecentWeather({
            latitude: -23.5,
            longitude: -46.6,
        });

        expect(result.isFailure()).toBe(true);
    });
});
