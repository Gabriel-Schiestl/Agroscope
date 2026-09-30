import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import { WeatherData } from '../models/Sickness';

export interface UserLocation {
    latitude: number;
    longitude: number;
}

export interface WeatherService {
    /**
     * Clima recente da região (médias do período de incubação típico das
     * doenças foliares) e a estação do ano no hemisfério da localização.
     */
    getRecentWeather(
        location: UserLocation,
    ): Promise<Result<TechnicalException, WeatherData>>;
}
