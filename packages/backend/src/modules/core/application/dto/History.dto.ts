import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { SicknessDto } from './Sickness.dto';

export class HistoryDto {
    @IsString()
    id: string;

    @IsOptional()
    @IsString()
    sicknessId?: string;

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
}
