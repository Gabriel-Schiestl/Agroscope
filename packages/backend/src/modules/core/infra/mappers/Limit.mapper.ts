import { Limit } from '../../domain/models/Limit';
import { LimitModel } from '../models/Limit.model';

export class LimitMapper {
    static domainToModel(domain: Limit): LimitModel {
        return new LimitModel().setProps({
            id: domain.id,
            userId: domain.userId,
            imageCount: domain.imageCount,
            chatCount: domain.chatCount,
            lastAnalysis: domain.lastAnalysis,
            lastMessage: domain.lastMessage,
        });
    }

    static modelToDomain(model: LimitModel): Limit {
        return Limit.load(
            {
                userId: model.userId,
                imageCount: model.imageCount,
                chatCount: model.chatCount,
                lastAnalysis: model.lastAnalysis,
                lastMessage: model.lastMessage,
            },
            model.id,
        );
    }
}
