import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { Season, WeatherData } from '../../domain/models/Sickness';
import {
    UserLocation,
    WeatherService,
} from '../../domain/services/Weather.service';

interface OpenMeteoResponse {
    current: {
        temperature_2m: number;
        relative_humidity_2m: number;
    };
}

@Injectable()
export class OpenMeteoWeatherService implements WeatherService {
    private readonly logger = new Logger(OpenMeteoWeatherService.name);

    constructor(
        private readonly httpService: HttpService,
        @Inject('OPEN_METEO_API_URL')
        private readonly OPEN_METEO_API_URL: string,
    ) {}

    async getCurrentWeather(
        location: UserLocation,
    ): Promise<Result<TechnicalException, WeatherData>> {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get<OpenMeteoResponse>(
                    this.OPEN_METEO_API_URL,
                    {
                        params: {
                            latitude: location.latitude,
                            longitude: location.longitude,
                            current: 'temperature_2m,relative_humidity_2m',
                            timezone: 'America/Sao_Paulo',
                        },
                    },
                ),
            );

            return Res.success({
                temperature: data.current.temperature_2m,
                humidity: data.current.relative_humidity_2m,
                season: this.getCurrentSeason(),
            });
        } catch (e) {
            this.logger.error(
                `Falha ao consultar dados climáticos: ${e.message}`,
                e.stack,
            );
            return Res.failure(
                new TechnicalException(
                    `Não foi possível obter dados climáticos: ${e.message}`,
                ),
            );
        }
    }

    /**
     * Determina a estação do ano atual para o hemisfério sul (Brasil).
     * As estações são opostas ao hemisfério norte:
     *   Verão   → dez, jan, fev
     *   Outono  → mar, abr, mai
     *   Inverno → jun, jul, ago
     *   Primavera → set, out, nov
     */
    private getCurrentSeason(): Season {
        const month = new Date().getMonth() + 1; // 1-12

        if (month === 12 || month <= 2) return 'summer';
        if (month <= 5) return 'autumn';
        if (month <= 8) return 'winter';
        return 'spring';
    }
}
