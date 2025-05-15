import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { ClientDto } from './Client.dto';

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
