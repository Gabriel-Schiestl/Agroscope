import { History } from '../../../domain/models/History';
import { HistoryAppMapper } from '../History.mapper';

describe('HistoryAppMapper', () => {
    it('should map a History domain entity to a HistoryDto', () => {
        const createdAt = new Date('2026-01-01');
        const history = History.load(
            {
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
            },
            'history-1',
        );

        const dto = HistoryAppMapper.toDto(history);

        expect(dto).toEqual({
            id: 'history-1',
            sicknessId: 'sickness-1',
            handling: 'Pulverização',
            image: 'base64-image',
            crop: 'Milho',
            cropConfidence: 0.95,
            sicknessConfidence: 0.8,
            createdAt,
            causes: 'causas',
            explanation: 'explicação',
            precautions: 'precauções',
        });
    });
});
