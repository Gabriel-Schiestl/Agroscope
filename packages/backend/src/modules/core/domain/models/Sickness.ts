import { Agg } from 'src/shared/Agg';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';

export type RainfallDependency = 'low' | 'medium' | 'high';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type ClimateMismatch = 'temperature' | 'humidity' | 'season';

export interface ClimateConditions {
    temperatureMin?: number;
    temperatureMax?: number;
    temperatureOptimal?: number;
    humidityMin?: number;
    humidityMax?: number;
    rainfallDependency?: RainfallDependency;
    favorableSeasons?: Season[];
}

export interface WeatherData {
    temperature: number;
    humidity: number;
    season?: Season;
}

export interface SicknessProps {
    name: string;
    description?: string;
    symptoms: string[];
    climateConditions?: ClimateConditions;
}

export class Sickness extends Agg<SicknessProps> {
    private constructor(props: SicknessProps, id?: string) {
        super(props, id);
    }

    static create(props: SicknessProps): Result<BusinessException, Sickness> {
        if (!props.name) {
            return Res.failure(new BusinessException('Name is required'));
        }
        if (!props.symptoms || props.symptoms.length === 0) {
            return Res.failure(new BusinessException('Symptoms are required'));
        }
        if (props.climateConditions) {
            const climateError = Sickness.validateClimateConditions(
                props.climateConditions,
            );
            if (climateError) return Res.failure(climateError);
        }

        return Res.success(new Sickness(props));
    }

    static load(props: SicknessProps, id: string): Sickness {
        return new Sickness(props, id);
    }

    static isSickness(entity: any): entity is Sickness {
        return entity instanceof Sickness;
    }

    isCompatibleWithWeather(weather: WeatherData): boolean {
        return this.getWeatherMismatches(weather).length === 0;
    }

    /**
     * Retorna quais fatores climáticos da região estão fora das condições
     * favoráveis à doença. Lista vazia significa clima compatível.
     */
    getWeatherMismatches(weather: WeatherData): ClimateMismatch[] {
        const cc = this.props.climateConditions;
        if (!cc) return [];

        const mismatches: ClimateMismatch[] = [];

        if (
            (cc.temperatureMin != null &&
                weather.temperature < cc.temperatureMin) ||
            (cc.temperatureMax != null &&
                weather.temperature > cc.temperatureMax)
        ) {
            mismatches.push('temperature');
        }
        if (
            (cc.humidityMin != null && weather.humidity < cc.humidityMin) ||
            (cc.humidityMax != null && weather.humidity > cc.humidityMax)
        ) {
            mismatches.push('humidity');
        }
        if (
            weather.season &&
            cc.favorableSeasons &&
            cc.favorableSeasons.length > 0 &&
            !cc.favorableSeasons.includes(weather.season)
        ) {
            mismatches.push('season');
        }

        return mismatches;
    }

    get name(): string {
        return this.props.name;
    }

    get description(): string {
        return this.props.description;
    }

    get symptoms(): string[] {
        return this.props.symptoms;
    }

    get climateConditions(): ClimateConditions | undefined {
        return this.props.climateConditions;
    }

    private static validateClimateConditions(
        cc: ClimateConditions,
    ): BusinessException | null {
        if (
            cc.temperatureMin !== undefined &&
            cc.temperatureMax !== undefined &&
            cc.temperatureMin > cc.temperatureMax
        ) {
            return new BusinessException(
                'temperatureMin não pode ser maior que temperatureMax',
            );
        }
        if (
            cc.humidityMin !== undefined &&
            cc.humidityMax !== undefined &&
            cc.humidityMin > cc.humidityMax
        ) {
            return new BusinessException(
                'humidityMin não pode ser maior que humidityMax',
            );
        }
        if (
            cc.humidityMin !== undefined &&
            (cc.humidityMin < 0 || cc.humidityMin > 100)
        ) {
            return new BusinessException(
                'humidityMin deve estar entre 0 e 100',
            );
        }
        if (
            cc.humidityMax !== undefined &&
            (cc.humidityMax < 0 || cc.humidityMax > 100)
        ) {
            return new BusinessException(
                'humidityMax deve estar entre 0 e 100',
            );
        }

        return null;
    }
}
