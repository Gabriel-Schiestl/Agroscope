import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { ClientDto } from './Client.dto';
import { OmitType } from '@nestjs/mapped-types';

export class AgriculturalEngineerDto {
    @IsString()
    id: string;

    @IsString()
    userId: string;

    @IsOptional()
    @IsArray()
    @Type(() => ClientDto)
    clients: ClientDto[];
}

export class CreateAgriculturalEngineerDto extends OmitType(
    AgriculturalEngineerDto,
    ['id', 'clients'],
) {}
