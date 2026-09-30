import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { SicknessDto } from './Sickness.dto';
import { ClimateMismatch, Season } from '../../domain/models/Sickness';

export class ClimateValidationDto {
    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsNumber()
    temperature: number;

    @IsNumber()
    humidity: number;

    @IsOptional()
    @IsString()
    season?: Season;

    @IsBoolean()
    compatible: boolean;

    @IsArray()
    mismatches: ClimateMismatch[];
}

export class HistoryDto {
    @IsString()
    id: string;

    @IsOptional()
    @IsString()
    sicknessId?: string;

    @IsOptional()
    @IsString()
    sicknessName?: string;

    @IsString()
    handling: string;

    @IsString()
    image: string;

    @IsOptional()
    @IsNumber()
    sicknessConfidence?: number;

    @IsString()
    crop: string;

    @IsNumber()
    cropConfidence: number;

    @IsDate()
    createdAt: Date;

    @IsString()
    explanation?: string;

    @IsString()
    causes?: string;

    @IsOptional()
    @IsString()
    precautions?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => ClimateValidationDto)
    climateValidation?: ClimateValidationDto;
}
