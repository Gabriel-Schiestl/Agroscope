import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';
import { Crop } from '../../domain/models/Crop';

export class PredictDto {
    @IsNotEmpty({
        message:
            'A cultura é obrigatória. Selecione uma cultura antes de enviar a foto.',
    })
    // Só o formato é validado aqui; se a cultura está disponível é decidido no
    // PredictUseCase, com as culturas que a IA tem carregadas (GET /crops).
    @IsString()
    @MaxLength(40)
    @Matches(/^[A-Z][A-Z0-9_]*$/, {
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
