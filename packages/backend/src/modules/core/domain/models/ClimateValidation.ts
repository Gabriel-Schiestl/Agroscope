import { ClimateMismatch, Season, Sickness, WeatherData } from './Sickness';

/**
 * Resultado do cruzamento entre o clima recente da região do usuário e as
 * condições climáticas favoráveis à doença diagnosticada pela IA visual.
 */
export interface ClimateValidation {
    latitude: number;
    longitude: number;
    temperature: number;
    humidity: number;
    season?: Season;
    compatible: boolean;
    mismatches: ClimateMismatch[];
}

// Duas casas decimais (~1 km) bastam para o clima e evitam guardar a
// localização exata do usuário.
const COORDINATE_PRECISION = 100;

const roundCoordinate = (value: number): number =>
    Math.round(value * COORDINATE_PRECISION) / COORDINATE_PRECISION;

export const buildClimateValidation = (
    sickness: Sickness,
    weather: WeatherData,
    location: { latitude: number; longitude: number },
): ClimateValidation => {
    const mismatches = sickness.getWeatherMismatches(weather);

    return {
        latitude: roundCoordinate(location.latitude),
        longitude: roundCoordinate(location.longitude),
        temperature: weather.temperature,
        humidity: weather.humidity,
        season: weather.season,
        compatible: mismatches.length === 0,
        mismatches,
    };
};
