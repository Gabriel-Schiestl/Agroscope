import { IsString } from 'class-validator';

export class KnowledgeDto {
    @IsString()
    id: string;

    @IsString()
    sicknessId: string;

    @IsString()
    handling: string;
}
