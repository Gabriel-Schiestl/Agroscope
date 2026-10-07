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
    hourly: {
        time: string[];
        temperature_2m: (number | null)[];
        relative_humidity_2m: (number | null)[];
    };
}

// Janela usada na média: cobre o período de incubação típico das doenças
// foliares, então reflete melhor as condições que favoreceram a infecção do
// que uma leitura pontual do momento da análise.
const PAST_DAYS = 7;

@Injectable()
export class OpenMeteoWeatherService implements WeatherService {
    private readonly logger = new Logger(OpenMeteoWeatherService.name);

    constructor(
        private readonly httpService: HttpService,
        @Inject('OPEN_METEO_API_URL')
        private readonly OPEN_METEO_API_URL: string,
    ) {}

    async getRecentWeather(
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
                            hourly: 'temperature_2m,relative_humidity_2m',
                            past_days: PAST_DAYS,
                            forecast_days: 1,
                            timezone: 'GMT',
                        },
                        timeout: 5000,
                    },
                ),
            );

            // forecast_days=1 inclui as horas restantes de hoje (previsão);
            // só entram na média as horas que já passaram.
            const now = Date.now();
            const pastIndexes = data.hourly.time
                .map((time, index) => ({
                    index,
                    timestamp: Date.parse(`${time}Z`),
                }))
                .filter(({ timestamp }) => timestamp <= now)
                .map(({ index }) => index);

            const temperature = this.average(
                pastIndexes.map((i) => data.hourly.temperature_2m[i]),
            );
            const humidity = this.average(
                pastIndexes.map((i) => data.hourly.relative_humidity_2m[i]),
            );

            if (temperature === null || humidity === null) {
                return Res.failure(
                    new TechnicalException(
                        'Open-Meteo não retornou dados climáticos para o período',
                    ),
                );
            }

            return Res.success({
                temperature,
                humidity,
                season: this.getCurrentSeason(location.latitude),
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

    private average(values: (number | null)[]): number | null {
        const valid = values.filter(
            (v): v is number => typeof v === 'number' && !isNaN(v),
        );
        if (valid.length === 0) return null;

        const mean = valid.reduce((sum, v) => sum + v, 0) / valid.length;
        return Math.round(mean * 10) / 10;
    }

    /**
     * Estação do ano (meteorológica) conforme o hemisfério da localização.
     * Hemisfério sul (Brasil):
     *   Verão   → dez, jan, fev
     *   Outono  → mar, abr, mai
     *   Inverno → jun, jul, ago
     *   Primavera → set, out, nov
     * No hemisfério norte as estações são invertidas.
     */
    private getCurrentSeason(latitude: number): Season {
        const month = new Date().getMonth() + 1; // 1-12

        let southern: Season;
        if (month === 12 || month <= 2) southern = 'summer';
        else if (month <= 5) southern = 'autumn';
        else if (month <= 8) southern = 'winter';
        else southern = 'spring';

        if (latitude < 0) return southern;

        const opposite: Record<Season, Season> = {
            summer: 'winter',
            autumn: 'spring',
            winter: 'summer',
            spring: 'autumn',
        };
        return opposite[southern];
    }
}
