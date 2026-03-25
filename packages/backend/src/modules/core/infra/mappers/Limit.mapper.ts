import { Limit } from '../../domain/models/Limit';
import { LimitModel } from '../models/Limit.model';

export class LimitMapper {
    static domainToModel(domain: Limit): LimitModel {
        return new LimitModel().setProps({
            id: domain.id,
            userId: domain.userId,
            imageRequests: domain.imageRequests,
            chatRequests: domain.chatRequests,
            lastAnalysis: domain.lastAnalysis,
            lastMessage: domain.lastMessage,
        });
    }

    static modelToDomain(model: LimitModel): Limit {
        return Limit.load(
            {
                userId: model.userId,
                imageRequests: model.imageRequests,
                chatRequests: model.chatRequests,
                lastAnalysis: model.lastAnalysis,
                lastMessage: model.lastMessage,
            },
            model.id,
        );
    }
}
