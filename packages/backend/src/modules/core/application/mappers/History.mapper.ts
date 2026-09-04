import { History } from '../../domain/models/History';
import { HistoryDto } from '../dto/History.dto';

export class HistoryAppMapper {
    static toDto(history: History): HistoryDto {
        return {
            id: history.id,
            sicknessId: history.sicknessId,
            sicknessName: history.sicknessName,
            handling: history.handling,
            image: history.image,
            crop: history.crop,
            cropConfidence: history.cropConfidence,
            sicknessConfidence: history.sicknessConfidence,
            createdAt: history.createdAt,
            causes: history.causes,
            explanation: history.explanation,
            precautions: history.precautions,
        };
    }
}
