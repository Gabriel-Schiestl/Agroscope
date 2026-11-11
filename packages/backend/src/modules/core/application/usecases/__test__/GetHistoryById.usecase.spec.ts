import { Res } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { History } from '../../../domain/models/History';
import { HistoryRepository } from '../../../domain/repositories/History.repository';
import { GetHistoryByIdUseCase } from '../GetHistoryById.usecase';

describe('GetHistoryByIdUseCase', () => {
    const history = History.create({
        handling: 'Pulverização',
        crop: 'Milho',
        cropConfidence: 0.95,
        image: 'base64-image-data',
        userId: 'user-1',
    });

    let historyRepository: jest.Mocked<HistoryRepository>;
    let useCase: GetHistoryByIdUseCase;
    let historyVisibility: { getVisibleIds: jest.Mock };

    beforeEach(() => {
        historyRepository = {
            save: jest.fn(),
            getAll: jest.fn(),
            getById: jest.fn().mockResolvedValue(Res.success(history)),
            getByUserId: jest.fn(),
            deleteByUserId: jest.fn(),
            getAnalyticsByUserId: jest.fn(),
        };
        historyVisibility = {
            getVisibleIds: jest.fn().mockResolvedValue(Res.success(null)),
        };
        useCase = new GetHistoryByIdUseCase(
            historyRepository,
            historyVisibility as any,
        );
    });

    it('should return the history DTO when it belongs to the user', async () => {
        const result = await useCase.execute({
            id: history.id,
            userId: 'user-1',
        });

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value.id).toBe(history.id);
        expect(result.isSuccess() && result.value.crop).toBe('Milho');
    });

    it('should fail when the history does not belong to the requesting user', async () => {
        const result = await useCase.execute({
            id: history.id,
            userId: 'another-user',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should propagate a repository failure', async () => {
        const error = new RepositoryNoDataFound('not found');
        historyRepository.getById.mockResolvedValue(Res.failure(error));

        const result = await useCase.execute({
            id: 'unknown-id',
            userId: 'user-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBe(error);
    });

    it('should block an analysis hidden by a plan without full history', async () => {
        historyVisibility.getVisibleIds.mockResolvedValue(
            Res.success(['another-analysis']),
        );

        const result = await useCase.execute({
            id: history.id,
            userId: 'user-1',
        });

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error.message).toContain(
            'apenas a análise mais recente',
        );
    });
});
