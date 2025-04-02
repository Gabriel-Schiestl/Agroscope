import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { HistoryDto } from './History.dto';
import { PersonType } from '../../domain/models/Client';
import { Address } from '../../domain/models/Address';

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

    @IsString()
    address: Address;

    @IsNumber()
    totalArea: number;

    @IsNumber()
    totalAreaPlanted: number;
}
