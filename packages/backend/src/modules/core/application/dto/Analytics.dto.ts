import { Type } from 'class-transformer';
import {
    IsArray,
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export type AnalyticsGranularityDto = 'day' | 'week' | 'month';

export class DiseaseCountDto {
    @IsString()
    sicknessId: string;

    @IsString()
    sicknessName: string;

    @IsNumber()
    count: number;

    @IsNumber()
    percentage: number;
}

export class CropCountDto {
    @IsString()
    crop: string;

    @IsNumber()
    count: number;

    @IsNumber()
    percentage: number;
}

export class PeriodCountDto {
    @IsString()
    period: string;

    @IsNumber()
    count: number;
}

export class DiseasePeriodPointDto {
    @IsString()
    period: string;

    @IsNumber()
    count: number;
}

export class DiseasePeriodSeriesDto {
    @IsString()
    sicknessId: string;

    @IsString()
    sicknessName: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DiseasePeriodPointDto)
    points: DiseasePeriodPointDto[];
}

export class DiseasePeakDto {
    @IsString()
    sicknessId: string;

    @IsString()
    sicknessName: string;

    @IsString()
    period: string;

    @IsNumber()
    count: number;
}

export class HistoryAnalyticsDto {
    @IsNumber()
    totalAnalyses: number;

    @IsNumber()
    healthyCount: number;

    @IsNumber()
    diseasedCount: number;

    @IsOptional()
    @IsNumber()
    averageCropConfidence: number | null;

    @IsOptional()
    @IsNumber()
    averageSicknessConfidence: number | null;

    @IsNumber()
    distinctCropsCount: number;

    @IsNumber()
    distinctDiseasesCount: number;

    @IsIn(['day', 'week', 'month'])
    granularity: AnalyticsGranularityDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DiseaseCountDto)
    byDisease: DiseaseCountDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CropCountDto)
    byCrop: CropCountDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PeriodCountDto)
    byPeriod: PeriodCountDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => PeriodCountDto)
    peakPeriod: PeriodCountDto | null;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DiseasePeriodSeriesDto)
    diseaseIncidenceByPeriod: DiseasePeriodSeriesDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DiseasePeakDto)
    diseasePeakPeriods: DiseasePeakDto[];
}
