import { IsString } from 'class-validator';
import { ReportStatus } from '../../domain/models/Report';

export class ReportDto {
    @IsString()
    id: string;

    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsString()
    status: ReportStatus;

    @IsString({ each: true })
    attachments?: string[];

    @IsString()
    createdAt?: Date;
}
