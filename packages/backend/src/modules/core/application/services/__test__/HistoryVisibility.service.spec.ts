import { Res } from 'src/shared/Result';
import { HistoryVisibilityService } from '../HistoryVisibility.service';

describe('HistoryVisibilityService', () => {
    const build = (
        featureFlags: string[],
        planId: string | undefined = 'plan-1',
    ) => {
        const userRepository: any = {
            getById: jest.fn().mockResolvedValue(Res.success({ planId })),
        };
        const planRepository: any = {
            getById: jest.fn().mockResolvedValue(
                Res.success({
                    hasFeature: (f: string) => featureFlags.includes(f),
                }),
            ),
        };
        const historyRepository: any = {
            getByUserId: jest
                .fn()
                .mockResolvedValue(
                    Res.success([{ id: 'newest' }, { id: 'older' }]),
                ),
        };
        return {
            service: new HistoryVisibilityService(
                userRepository,
                planRepository,
                historyRepository,
            ),
            historyRepository,
        };
    };

    it('returns null (everything visible) for plans with FULL_HISTORY', async () => {
        const { service, historyRepository } = build(['FULL_HISTORY']);

        const result = await service.getVisibleIds('user-1');

        expect(result.isSuccess() && result.value).toBeNull();
        expect(historyRepository.getByUserId).not.toHaveBeenCalled();
    });

    it('returns only the most recent analysis for plans without FULL_HISTORY', async () => {
        const { service, historyRepository } = build([]);

        const result = await service.getVisibleIds('user-1');

        expect(result.isSuccess() && result.value).toEqual(['newest']);
        expect(historyRepository.getByUserId).toHaveBeenCalledWith('user-1', {
            order: 'DESC',
        });
    });

    it('treats a user without plan as restricted', async () => {
        const { service } = build(['FULL_HISTORY'], null);

        const result = await service.getVisibleIds('user-1');

        expect(result.isSuccess() && result.value).toEqual(['newest']);
    });
});
