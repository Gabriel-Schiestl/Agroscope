import { Limit } from '../../../domain/models/Limit';
import { LimitModel } from '../../models/Limit.model';
import { LimitMapper } from '../Limit.mapper';

describe('LimitMapper', () => {
    it('should map a Limit domain entity to a LimitModel', () => {
        const lastAnalysis = new Date('2026-01-01');
        const lastMessage = new Date('2026-01-02');
        const limit = Limit.load(
            {
                imageRequests: 3,
                chatRequests: 5,
                lastAnalysis,
                lastMessage,
            },
            'limit-1',
        );

        const model = LimitMapper.domainToModel(limit);

        expect(model).toBeInstanceOf(LimitModel);
        expect(model.id).toBe('limit-1');
        expect(model.imageRequests).toBe(3);
        expect(model.chatRequests).toBe(5);
        expect(model.lastAnalysis).toBe(lastAnalysis);
        expect(model.lastMessage).toBe(lastMessage);
    });

    it('should map a LimitModel back to a Limit domain entity', () => {
        const model = new LimitModel().setProps({
            id: 'limit-1',
            imageRequests: 3,
            chatRequests: 5,
        });

        const limit = LimitMapper.modelToDomain(model);

        expect(limit).toBeInstanceOf(Limit);
        expect(limit.id).toBe('limit-1');
        expect(limit.imageRequests).toBe(3);
        expect(limit.chatRequests).toBe(5);
    });
});
