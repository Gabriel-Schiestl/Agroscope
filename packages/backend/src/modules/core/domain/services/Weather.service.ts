import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import { WeatherData } from '../models/Sickness';

export interface UserLocation {
    latitude: number;
    longitude: number;
}

export interface WeatherService {
    getCurrentWeather(
        location: UserLocation,
    ): Promise<Result<TechnicalException, WeatherData>>;
}
