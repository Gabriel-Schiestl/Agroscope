import { History } from '../../domain/models/History';
import { HistoryModel } from '../models/History.model';
import { SicknessMapper } from './Sickness.mapper';

export class HistoryMapper {
    static domainToModel(domain: History): HistoryModel {
        return new HistoryModel().setProps({
            id: domain.id,
            createdAt: domain.createdAt,
            sickness: domain.sickness,
            sicknessConfidence: domain.sicknessConfidence,
            crop: domain.crop,
            cropConfidence: domain.cropConfidence,
            handling: domain.handling,
            image: domain.image,
            explanation: domain.explanation,
            userId: domain.userId,
            causes: domain.causes,
        });
    }

    static modelToDomain(model: HistoryModel): History {
        return History.load(
            {
                createdAt: model.createdAt,
                sickness: model.sickness,
                sicknessConfidence: model.sicknessConfidence,
                crop: model.crop,
                cropConfidence: model.cropConfidence,
                handling: model.handling,
                image: model.image,
                explanation: model.explanation,
                userId: model.userId,
                causes: model.causes,
            },
            model.id,
        );
    }
}
