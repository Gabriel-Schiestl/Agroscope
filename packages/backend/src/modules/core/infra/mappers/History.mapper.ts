import { History } from '../../domain/models/History';
import { Knowledge } from '../../domain/models/Knowledge';
import { HistoryModel } from '../models/History.model';
import { KnowledgeModel } from '../models/Knowledge.model';

export class HistoryMapper {
    static domainToModel(domain: History): HistoryModel {
        return new HistoryModel().setProps({
            id: domain.id,
            createdAt: domain.createdAt,
            prediction: domain.prediction,
            handling: domain.handling,
            image: domain.image,
        });
    }

    static modelToDomain(model: HistoryModel): History {
        return History.load(
            {
                createdAt: model.createdAt,
                prediction: model.prediction,
                handling: model.handling,
                image: model.image,
            },
            model.id,
        );
    }
}
