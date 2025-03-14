import { IsArray, IsString } from 'class-validator';

export class SicknessDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsArray()
    symptoms: string[];
}
