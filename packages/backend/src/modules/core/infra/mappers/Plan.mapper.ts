import { Plan } from '../../domain/models/Plan';
import { PlanModel } from '../models/Plan.model';

export class PlanMapper {
    static domainToModel(domain: Plan): PlanModel {
        const model = new PlanModel();
        model.id = domain.id;
        model.type = domain.type;
        model.imageLimit = domain.imageLimit;
        model.chatLimit = domain.chatLimit;
        return model;
    }

    static modelToDomain(model: PlanModel): Plan {
        return Plan.load(
            {
                type: model.type,
                imageLimit: model.imageLimit,
                chatLimit: model.chatLimit,
            },
            model.id,
        );
    }
}
