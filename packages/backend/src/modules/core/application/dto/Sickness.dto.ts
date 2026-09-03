import {
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RainfallDependency, Season } from '../../domain/models/Sickness';

export class ClimateConditionsDto {
    @IsOptional()
    @IsNumber()
    temperatureMin?: number;

    @IsOptional()
    @IsNumber()
    temperatureMax?: number;

    @IsOptional()
    @IsNumber()
    temperatureOptimal?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    humidityMin?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    humidityMax?: number;

    @IsOptional()
    @IsEnum(['low', 'medium', 'high'])
    rainfallDependency?: RainfallDependency;

    @IsOptional()
    @IsArray()
    @IsEnum(['spring', 'summer', 'autumn', 'winter'], { each: true })
    favorableSeasons?: Season[];
}

export class SicknessDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    symptoms: string[];

    @IsOptional()
    @ValidateNested()
    @Type(() => ClimateConditionsDto)
    climateConditions?: ClimateConditionsDto;
}
