import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEmail,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { Address } from '../../domain/models/Address';
import { Crop, PersonType } from '../../domain/models/Client';
import { ReportDto } from './Report.dto';
import { CalendarEventDto } from './CalendarEvent.dto';

export class ClientDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsString()
    telephone: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    person: PersonType;

    @IsString()
    document: string;

    address: Address;

    @IsNumber()
    totalArea: number;

    @IsNumber()
    totalAreaPlanted: number;

    @IsBoolean()
    active: boolean;

    @IsOptional()
    actualCrop?: Crop;

    @IsOptional()
    @Type(() => ReportDto)
    reports?: ReportDto[];

    @IsOptional()
    @Type(() => CalendarEventDto)
    calendarEvents?: CalendarEventDto[];

    @IsDate()
    createdAt?: Date;
}

export class CreateClientDto extends OmitType(ClientDto, ['id', 'active']) {}
