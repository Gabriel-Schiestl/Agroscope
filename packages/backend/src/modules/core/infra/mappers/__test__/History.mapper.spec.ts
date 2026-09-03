import { History } from '../../../domain/models/History';
import { HistoryModel } from '../../models/History.model';
import { HistoryMapper } from '../History.mapper';

describe('HistoryMapper', () => {
    it('should map a History domain entity to a HistoryModel', () => {
        const history = History.load(
            {
                createdAt: new Date('2026-01-01'),
                sicknessId: 'sickness-1',
                sicknessConfidence: 0.8,
                crop: 'Milho',
                cropConfidence: 0.95,
                handling: 'Pulverização',
                image: 'base64-image',
                explanation: 'explicação',
                userId: 'user-1',
                causes: 'causas',
                precautions: 'precauções',
            },
            'history-1',
        );

        const model = HistoryMapper.domainToModel(history);

        expect(model).toBeInstanceOf(HistoryModel);
        expect(model.id).toBe('history-1');
        expect(model.crop).toBe('Milho');
        expect(model.cropConfidence).toBe(0.95);
        expect(model.sicknessId).toBe('sickness-1');
        expect(model.userId).toBe('user-1');
    });

    it('should map a HistoryModel back to a History domain entity', () => {
        const createdAt = new Date('2026-01-01');
        const model = new HistoryModel().setProps({
            id: 'history-1',
            createdAt,
            sicknessId: 'sickness-1',
            sicknessConfidence: 0.8,
            crop: 'Milho',
            cropConfidence: 0.95,
            handling: 'Pulverização',
            image: 'base64-image',
            explanation: 'explicação',
            userId: 'user-1',
            causes: 'causas',
            precautions: 'precauções',
        });

        const history = HistoryMapper.modelToDomain(model);

        expect(history).toBeInstanceOf(History);
        expect(history.id).toBe('history-1');
        expect(history.createdAt).toBe(createdAt);
        expect(history.crop).toBe('Milho');
        expect(history.userId).toBe('user-1');
        expect(history.causes).toBe('causas');
        expect(history.precautions).toBe('precauções');
    });
});
