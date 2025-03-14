import { Sickness } from '../../domain/models/Sickness';
import { SicknessDto } from '../dto/Sickness.dto';

export class SicknessAppMapper {
    static toDto(sickness: Sickness): SicknessDto {
        return {
            id: sickness.id,
            name: sickness.name,
            description: sickness.description,
            symptoms: sickness.symptoms,
        };
    }
}
