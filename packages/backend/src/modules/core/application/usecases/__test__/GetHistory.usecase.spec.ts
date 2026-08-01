import { Res } from 'src/shared/Result';
import { History } from '../../../domain/models/History';
import { HistoryRepository } from '../../../domain/repositories/History.repository';
import { GetHistoryUseCase } from '../GetHistory.usecase';

describe('GetHistoryUseCase', () => {
    const history = History.create({
        handling: 'Pulverização',
        crop: 'Milho',
        cropConfidence: 0.95,
        image: 'base64-image-data',
        userId: 'user-1',
    });

    const historyRepository: HistoryRepository = {
        save: jest.fn(),
        getAll: jest.fn(),
        getById: jest.fn(),
        getByUserId: jest.fn().mockResolvedValue(Res.success([history])),
    };

    it('should return plain DTOs whose fields survive JSON serialization', async () => {
        const useCase = new GetHistoryUseCase(historyRepository);

        const result = await useCase.execute({ userId: 'user-1' });

        expect(result.isFailure()).toBe(false);
        if (result.isFailure()) return;

        // History uses ES private (#) fields with no toJSON — JSON.stringify
        // silently drops them, so any regression back to returning the domain
        // entity directly would make this response body come back as `{}`.
        const serialized = JSON.parse(JSON.stringify(result.value));

        expect(serialized).toEqual([
            expect.objectContaining({
                id: history.id,
                crop: 'Milho',
                cropConfidence: 0.95,
                handling: 'Pulverização',
                image: 'base64-image-data',
            }),
        ]);
    });
});
