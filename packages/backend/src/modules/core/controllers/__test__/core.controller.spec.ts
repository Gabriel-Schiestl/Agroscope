import { Res } from 'src/shared/Result';
import { PredictUseCase } from '../../application/usecases/Predict.usecase';
import { GetHistoryUseCase } from '../../application/usecases/GetHistory.usecase';
import { GetHistoryByIdUseCase } from '../../application/usecases/GetHistoryById.usecase';
import { GetLimitUseCase } from '../../application/usecases/GetLimit.usecase';
import { GetHistoryAnalyticsQuery } from '../../application/query/GetHistoryAnalytics.query';
import { CoreController } from '../core.controller';

describe('CoreController', () => {
    let predictUseCase: jest.Mocked<PredictUseCase>;
    let getHistoryUseCase: jest.Mocked<GetHistoryUseCase>;
    let getHistoryByIdUseCase: jest.Mocked<GetHistoryByIdUseCase>;
    let getLimitUseCase: jest.Mocked<GetLimitUseCase>;
    let getHistoryAnalyticsQuery: jest.Mocked<GetHistoryAnalyticsQuery>;
    let controller: CoreController;

    const req = { user: { sub: 'user-1' } } as any;

    beforeEach(() => {
        predictUseCase = { execute: jest.fn().mockResolvedValue(Res.success({})) } as any;
        getHistoryUseCase = { execute: jest.fn().mockResolvedValue(Res.success([])) } as any;
        getHistoryByIdUseCase = { execute: jest.fn().mockResolvedValue(Res.success({})) } as any;
        getLimitUseCase = { execute: jest.fn().mockResolvedValue(Res.success({})) } as any;
        getHistoryAnalyticsQuery = { execute: jest.fn().mockResolvedValue(Res.success({})) } as any;
        controller = new CoreController(
            predictUseCase,
            getHistoryUseCase,
            getHistoryByIdUseCase,
            getLimitUseCase,
            getHistoryAnalyticsQuery,
        );
    });

    describe('predict', () => {
        it('should pass a parsed location when latitude and longitude are valid', async () => {
            await controller.predict(
                { path: '/tmp/image.jpg' } as any,
                { latitude: '-23.5', longitude: '-46.6' },
                req,
            );

            expect(predictUseCase.execute).toHaveBeenCalledWith({
                imagePath: '/tmp/image.jpg',
                userId: 'user-1',
                location: { latitude: -23.5, longitude: -46.6 },
            });
        });

        it('should omit the location when latitude/longitude are missing', async () => {
            await controller.predict(
                { path: '/tmp/image.jpg' } as any,
                {},
                req,
            );

            expect(predictUseCase.execute).toHaveBeenCalledWith(
                expect.objectContaining({ location: undefined }),
            );
        });

        it('should omit the location when coordinates are out of range', async () => {
            await controller.predict(
                { path: '/tmp/image.jpg' } as any,
                { latitude: '999', longitude: '999' },
                req,
            );

            expect(predictUseCase.execute).toHaveBeenCalledWith(
                expect.objectContaining({ location: undefined }),
            );
        });

        it('should omit the location when coordinates are not numeric', async () => {
            await controller.predict(
                { path: '/tmp/image.jpg' } as any,
                { latitude: 'abc', longitude: 'def' },
                req,
            );

            expect(predictUseCase.execute).toHaveBeenCalledWith(
                expect.objectContaining({ location: undefined }),
            );
        });
    });

    describe('getHistory', () => {
        it('should forward parsed filters to GetHistoryUseCase', async () => {
            await controller.getHistory(
                {
                    crop: 'Milho',
                    startDate: '2026-01-01',
                    endDate: '2026-01-31',
                    order: 'ASC',
                },
                req,
            );

            expect(getHistoryUseCase.execute).toHaveBeenCalledWith({
                userId: 'user-1',
                filters: {
                    crop: 'Milho',
                    startDate: new Date('2026-01-01'),
                    endDate: new Date('2026-01-31'),
                    order: 'ASC',
                },
            });
        });
    });

    describe('getHistoryAnalytics', () => {
        it('should default granularity to month when missing', async () => {
            await controller.getHistoryAnalytics({}, req);

            expect(getHistoryAnalyticsQuery.execute).toHaveBeenCalledWith(
                expect.objectContaining({ granularity: 'month' }),
            );
        });

        it('should default granularity to month when invalid', async () => {
            await controller.getHistoryAnalytics(
                { granularity: 'year' } as any,
                req,
            );

            expect(getHistoryAnalyticsQuery.execute).toHaveBeenCalledWith(
                expect.objectContaining({ granularity: 'month' }),
            );
        });

        it('should forward a valid granularity as-is', async () => {
            await controller.getHistoryAnalytics(
                { granularity: 'week' } as any,
                req,
            );

            expect(getHistoryAnalyticsQuery.execute).toHaveBeenCalledWith(
                expect.objectContaining({ granularity: 'week' }),
            );
        });
    });

    describe('getHistoryById', () => {
        it("should forward the id and the requesting user's id", async () => {
            await controller.getHistoryById('history-1', req);

            expect(getHistoryByIdUseCase.execute).toHaveBeenCalledWith({
                id: 'history-1',
                userId: 'user-1',
            });
        });
    });

    describe('getLimit', () => {
        it("should forward the requesting user's id", async () => {
            await controller.getLimit(req);

            expect(getLimitUseCase.execute).toHaveBeenCalledWith({
                userId: 'user-1',
            });
        });
    });
});
