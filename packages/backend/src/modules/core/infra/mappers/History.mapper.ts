import { History } from '../../domain/models/History';
import { HistoryModel } from '../models/History.model';
import { SicknessMapper } from './Sickness.mapper';

export class HistoryMapper {
    static domainToModel(domain: History): HistoryModel {
        return new HistoryModel().setProps({
            id: domain.id,
            createdAt: domain.createdAt,
            sickness: SicknessMapper.domainToModel(domain.sickness),
            handling: domain.handling,
            image: domain.image,
        });
    }

    static modelToDomain(model: HistoryModel): History {
        return History.load(
            {
                createdAt: model.createdAt,
                sickness: SicknessMapper.modelToDomain(model.sickness),
                handling: model.handling,
                image: model.image,
            },
            model.id,
        );
    }
}
