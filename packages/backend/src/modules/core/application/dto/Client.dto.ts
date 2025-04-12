import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { HistoryDto } from './History.dto';
import { PersonType } from '../../domain/models/Client';
import { Address } from '../../domain/models/Address';
import { Visit } from '../../domain/models/Visit';
import { VisitDto } from './Visit.dto';
import { OmitType } from '@nestjs/mapped-types';

export class ClientDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsString()
    telephone: string;

    @IsString()
    person: PersonType;

    @IsString()
    document: string;

    address: Address;

    @IsNumber()
    totalArea: number;

    @IsNumber()
    totalAreaPlanted: number;

    @IsOptional()
    @Type(() => HistoryDto)
    visits?: VisitDto[];
}

export class CreateClientDto extends OmitType(ClientDto, ['id']) {}
