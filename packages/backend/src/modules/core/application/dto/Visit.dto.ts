import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { VisitStatus } from '../../domain/models/Visit';
import { ReportDto } from './Report.dto';

export class VisitDto {
    @IsString()
    id: string;

    @IsString()
    status: VisitStatus;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @Type(() => Date)
    scheduledDate?: Date;

    @Type(() => Date)
    createdAt?: Date;
}
