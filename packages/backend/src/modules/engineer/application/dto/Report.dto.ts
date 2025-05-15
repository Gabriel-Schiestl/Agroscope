import { IsString } from 'class-validator';

export enum ReportStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    SENT = 'SENT',
}

export class ReportDto {
    @IsString()
    id: string;

    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsString()
    status: ReportStatus;

    @IsString()
    clientId: string;

    @IsString()
    engineerId: string;

    @IsString({ each: true })
    attachments?: string[];

    @IsString()
    visitId?: string;

    @IsString()
    createdAt?: Date;
}
