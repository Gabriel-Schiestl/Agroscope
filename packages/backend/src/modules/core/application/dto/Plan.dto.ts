import { IsArray, IsNumber, IsString } from 'class-validator';

export class PlanDto {
    @IsString()
    id: string;

    @IsString()
    type: string;

    @IsNumber()
    imageLimit: number;

    @IsNumber()
    chatLimit: number;

    @IsArray()
    features: string[];

    @IsArray()
    featureFlags: string[];

    @IsNumber()
    price: number;
}
