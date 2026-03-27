import { Agg } from 'src/shared/Agg';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Res, Result } from 'src/shared/Result';

export type RainfallDependency = 'low' | 'medium' | 'high';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

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
        const cc = this.props.climateConditions;
        if (!cc) return true;

        if (
            cc.temperatureMin !== undefined &&
            weather.temperature < cc.temperatureMin
        ) {
            return false;
        }
        if (
            cc.temperatureMax !== undefined &&
            weather.temperature > cc.temperatureMax
        ) {
            return false;
        }
        if (cc.humidityMin !== undefined && weather.humidity < cc.humidityMin) {
            return false;
        }
        if (cc.humidityMax !== undefined && weather.humidity > cc.humidityMax) {
            return false;
        }
        if (
            weather.season &&
            cc.favorableSeasons &&
            cc.favorableSeasons.length > 0 &&
            !cc.favorableSeasons.includes(weather.season)
        ) {
            return false;
        }

        return true;
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
