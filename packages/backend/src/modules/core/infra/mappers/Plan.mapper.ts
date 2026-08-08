import { Plan } from '../../domain/models/Plan';
import { PlanModel } from '../models/Plan.model';

export class PlanMapper {
    static domainToModel(domain: Plan): PlanModel {
        const model = new PlanModel();
        model.id = domain.id;
        model.type = domain.type;
        model.imageLimit = domain.imageLimit;
        model.chatLimit = domain.chatLimit;
        model.features = domain.features;
        model.featureFlags = domain.featureFlags;
        model.price = domain.price;
        return model;
    }

    static modelToDomain(model: PlanModel): Plan {
        return Plan.load(
            {
                type: model.type,
                imageLimit: model.imageLimit,
                chatLimit: model.chatLimit,
                features: model.features,
                featureFlags: model.featureFlags,
                price: model.price,
            },
            model.id,
        );
    }
}
