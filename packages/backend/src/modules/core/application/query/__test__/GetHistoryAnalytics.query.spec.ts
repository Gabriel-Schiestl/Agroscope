import { Res } from 'src/shared/Result';
import { HistoryRepository } from '../../../domain/repositories/History.repository';
import { GetHistoryAnalyticsQuery } from '../GetHistoryAnalytics.query';

describe('GetHistoryAnalyticsQuery', () => {
    const buildRepository = (
        overrides?: Partial<HistoryRepository>,
    ): HistoryRepository => ({
        save: jest.fn(),
        getAll: jest.fn(),
        getById: jest.fn(),
        getByUserId: jest.fn(),
        getAnalyticsByUserId: jest.fn(),
        ...overrides,
    });

    it('computes percentages, peak period and per-disease peaks from raw aggregates', async () => {
        const repository = buildRepository({
            getAnalyticsByUserId: jest.fn().mockResolvedValue(
                Res.success({
                    totals: {
                        total: 10,
                        diseasedCount: 8,
                        averageCropConfidence: 92.5,
                        averageSicknessConfidence: 81.2,
                        distinctCropsCount: 2,
                        distinctDiseasesCount: 2,
                    },
                    byDisease: [
                        {
                            sicknessId: 'ferrugem',
                            sicknessName: 'Ferrugem Asiática',
                            count: 5,
                        },
                        {
                            sicknessId: 'antracnose',
                            sicknessName: 'Antracnose',
                            count: 3,
                        },
                    ],
                    byCrop: [
                        { crop: 'Soja', count: 6 },
                        { crop: 'Milho', count: 4 },
                    ],
                    byPeriod: [
                        { period: '2026-06-01', count: 4 },
                        { period: '2026-07-01', count: 6 },
                    ],
                    byDiseaseAndPeriod: [
                        {
                            sicknessId: 'ferrugem',
                            sicknessName: 'Ferrugem Asiática',
                            period: '2026-06-01',
                            count: 1,
                        },
                        {
                            sicknessId: 'ferrugem',
                            sicknessName: 'Ferrugem Asiática',
                            period: '2026-07-01',
                            count: 4,
                        },
                        {
                            sicknessId: 'antracnose',
                            sicknessName: 'Antracnose',
                            period: '2026-06-01',
                            count: 3,
                        },
                    ],
                }),
            ),
        });

        const query = new GetHistoryAnalyticsQuery(repository);
        const result = await query.execute({ userId: 'user-1' });

        expect(result.isFailure()).toBe(false);
        if (result.isFailure()) return;

        const dto = result.value;

        expect(dto.totalAnalyses).toBe(10);
        expect(dto.healthyCount).toBe(2);
        expect(dto.diseasedCount).toBe(8);
        expect(dto.granularity).toBe('month');

        expect(dto.byDisease).toEqual([
            expect.objectContaining({ sicknessId: 'ferrugem', percentage: 50 }),
            expect.objectContaining({
                sicknessId: 'antracnose',
                percentage: 30,
            }),
        ]);

        expect(dto.peakPeriod).toEqual({ period: '2026-07-01', count: 6 });

        expect(dto.diseaseIncidenceByPeriod).toHaveLength(2);
        const ferrugemSeries = dto.diseaseIncidenceByPeriod.find(
            (s) => s.sicknessId === 'ferrugem',
        );
        expect(ferrugemSeries?.points).toEqual([
            { period: '2026-06-01', count: 1 },
            { period: '2026-07-01', count: 4 },
        ]);

        expect(dto.diseasePeakPeriods).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    sicknessId: 'ferrugem',
                    period: '2026-07-01',
                    count: 4,
                }),
                expect.objectContaining({
                    sicknessId: 'antracnose',
                    period: '2026-06-01',
                    count: 3,
                }),
            ]),
        );
    });

    it('folds diseases past the top-5 limit into an "other" bucket', async () => {
        const diseaseNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        const byDisease = diseaseNames.map((name, index) => ({
            sicknessId: name,
            sicknessName: name,
            count: diseaseNames.length - index,
        }));
        const byDiseaseAndPeriod = diseaseNames.map((name) => ({
            sicknessId: name,
            sicknessName: name,
            period: '2026-07-01',
            count: 1,
        }));

        const repository = buildRepository({
            getAnalyticsByUserId: jest.fn().mockResolvedValue(
                Res.success({
                    totals: {
                        total: 7,
                        diseasedCount: 7,
                        averageCropConfidence: null,
                        averageSicknessConfidence: null,
                        distinctCropsCount: 1,
                        distinctDiseasesCount: 7,
                    },
                    byDisease,
                    byCrop: [{ crop: 'Soja', count: 7 }],
                    byPeriod: [{ period: '2026-07-01', count: 7 }],
                    byDiseaseAndPeriod,
                }),
            ),
        });

        const query = new GetHistoryAnalyticsQuery(repository);
        const result = await query.execute({ userId: 'user-1' });

        expect(result.isFailure()).toBe(false);
        if (result.isFailure()) return;

        const series = result.value.diseaseIncidenceByPeriod;
        expect(series).toHaveLength(6);
        const otherSeries = series.find((s) => s.sicknessId === 'other');
        expect(otherSeries?.points).toEqual([
            { period: '2026-07-01', count: 2 },
        ]);
        expect(result.value.diseasePeakPeriods).toHaveLength(5);
    });

    it('returns a zeroed DTO when there is no history yet', async () => {
        const repository = buildRepository({
            getAnalyticsByUserId: jest.fn().mockResolvedValue(
                Res.success({
                    totals: {
                        total: 0,
                        diseasedCount: 0,
                        averageCropConfidence: null,
                        averageSicknessConfidence: null,
                        distinctCropsCount: 0,
                        distinctDiseasesCount: 0,
                    },
                    byDisease: [],
                    byCrop: [],
                    byPeriod: [],
                    byDiseaseAndPeriod: [],
                }),
            ),
        });

        const query = new GetHistoryAnalyticsQuery(repository);
        const result = await query.execute({ userId: 'user-1' });

        expect(result.isFailure()).toBe(false);
        if (result.isFailure()) return;

        expect(result.value.totalAnalyses).toBe(0);
        expect(result.value.byDisease).toEqual([]);
        expect(result.value.peakPeriod).toBeNull();
        expect(result.value.diseaseIncidenceByPeriod).toEqual([]);
    });
});
