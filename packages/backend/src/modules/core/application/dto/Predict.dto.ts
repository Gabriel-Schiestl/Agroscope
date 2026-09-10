import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Crop } from '../../domain/models/Crop';

export class PredictDto {
    @IsNotEmpty({
        message:
            'A cultura é obrigatória. Selecione uma cultura antes de enviar a foto.',
    })
    @IsIn(Object.values(Crop), {
        message: 'Cultura inválida. Selecione uma das culturas disponíveis.',
    })
    crop: Crop;

    @IsOptional()
    @IsString()
    latitude?: string;

    @IsOptional()
    @IsString()
    longitude?: string;
}
