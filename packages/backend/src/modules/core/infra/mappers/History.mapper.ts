import { History } from '../../domain/models/History';
import { HistoryModel } from '../models/History.model';
import { SicknessMapper } from './Sickness.mapper';

export class HistoryMapper {
    static domainToModel(domain: History): HistoryModel {
        return new HistoryModel().setProps({
            id: domain.id,
            createdAt: domain.createdAt,
            sickness: domain.sickness
                ? SicknessMapper.domainToModel(domain.sickness)
                : null,
            sicknessConfidence: domain.sicknessConfidence,
            crop: domain.crop,
            cropConfidence: domain.cropConfidence,
            handling: domain.handling,
            image: domain.image,
            clientId: domain.clientId,
            userId: domain.userId,
        });
    }

    static modelToDomain(model: HistoryModel): History {
        return History.load(
            {
                createdAt: model.createdAt,
                sickness: SicknessMapper.modelToDomain(model.sickness),
                sicknessConfidence: model.sicknessConfidence,
                crop: model.crop,
                cropConfidence: model.cropConfidence,
                handling: model.handling,
                image: model.image,
                clientId: model.clientId,
                userId: model.userId,
            },
            model.id,
        );
    }
}
