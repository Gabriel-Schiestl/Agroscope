import { Inject, Injectable } from '@nestjs/common';
import { Res, Result } from 'src/shared/Result';
import {
    AnalyticsGranularity,
    DiseasePeriodCountRow,
    HistoryExceptions,
    HistoryRepository,
} from '../../domain/repositories/History.repository';
import {
    DiseasePeakDto,
    DiseasePeriodSeriesDto,
    HistoryAnalyticsDto,
} from '../dto/Analytics.dto';

const TOP_DISEASES_LIMIT = 5;
const OTHER_DISEASES_ID = 'other';
const OTHER_DISEASES_NAME = 'Outras doenças';

export interface GetHistoryAnalyticsParams {
    userId: string;
    startDate?: Date;
    endDate?: Date;
    granularity?: AnalyticsGranularity;
}

@Injectable()
export class GetHistoryAnalyticsQuery {
    constructor(
        @Inject('HistoryRepository')
        private readonly historyRepository: HistoryRepository,
    ) {}

    async execute({
        userId,
        startDate,
        endDate,
        granularity = 'month',
    }: GetHistoryAnalyticsParams): Promise<
        Result<HistoryExceptions, HistoryAnalyticsDto>
    > {
        const result = await this.historyRepository.getAnalyticsByUserId(
            userId,
            { startDate, endDate, granularity },
        );

        if (result.isFailure()) return Res.failure(result.error);

        const { totals, byDisease, byCrop, byPeriod, byDiseaseAndPeriod } =
            result.value;

        if (totals.total === 0) {
            return Res.success(
                this.buildEmptyDto(granularity, totals.distinctCropsCount),
            );
        }

        const dto: HistoryAnalyticsDto = {
            totalAnalyses: totals.total,
            healthyCount: totals.total - totals.diseasedCount,
            diseasedCount: totals.diseasedCount,
            averageCropConfidence: totals.averageCropConfidence,
            averageSicknessConfidence: totals.averageSicknessConfidence,
            distinctCropsCount: totals.distinctCropsCount,
            distinctDiseasesCount: totals.distinctDiseasesCount,
            granularity,
            byDisease: byDisease.map((row) => ({
                sicknessId: row.sicknessId,
                sicknessName: row.sicknessName,
                count: row.count,
                percentage: this.percentage(row.count, totals.total),
            })),
            byCrop: byCrop.map((row) => ({
                crop: row.crop,
                count: row.count,
                percentage: this.percentage(row.count, totals.total),
            })),
            byPeriod: byPeriod.map((row) => ({
                period: row.period,
                count: row.count,
            })),
            peakPeriod: this.findPeakPeriod(byPeriod),
            diseaseIncidenceByPeriod: this.buildDiseaseIncidenceSeries(
                byPeriod.map((row) => row.period),
                byDisease.map((row) => row.sicknessId),
                byDiseaseAndPeriod,
            ),
            diseasePeakPeriods: this.buildDiseasePeakPeriods(
                byDisease.map((row) => ({
                    sicknessId: row.sicknessId,
                    sicknessName: row.sicknessName,
                })),
                byDiseaseAndPeriod,
            ),
        };

        return Res.success(dto);
    }

    private percentage(count: number, total: number): number {
        if (total === 0) return 0;
        return Math.round((count / total) * 1000) / 10;
    }

    private findPeakPeriod(
        byPeriod: { period: string; count: number }[],
    ): HistoryAnalyticsDto['peakPeriod'] {
        if (byPeriod.length === 0) return null;

        return byPeriod.reduce((peak, current) =>
            current.count > peak.count ? current : peak,
        );
    }

    private buildDiseaseIncidenceSeries(
        periods: string[],
        diseaseIdsRankedByVolume: string[],
        byDiseaseAndPeriod: DiseasePeriodCountRow[],
    ): DiseasePeriodSeriesDto[] {
        const topDiseaseIds = new Set(
            diseaseIdsRankedByVolume.slice(0, TOP_DISEASES_LIMIT),
        );
        const hasOtherBucket =
            diseaseIdsRankedByVolume.length > TOP_DISEASES_LIMIT;

        const seriesByDisease = new Map<
            string,
            { sicknessName: string; countsByPeriod: Map<string, number> }
        >();

        for (const row of byDiseaseAndPeriod) {
            const isTop = topDiseaseIds.has(row.sicknessId);
            const key = isTop ? row.sicknessId : OTHER_DISEASES_ID;
            const name = isTop ? row.sicknessName : OTHER_DISEASES_NAME;

            if (!seriesByDisease.has(key)) {
                seriesByDisease.set(key, {
                    sicknessName: name,
                    countsByPeriod: new Map(),
                });
            }

            const series = seriesByDisease.get(key);
            series.countsByPeriod.set(
                row.period,
                (series.countsByPeriod.get(row.period) ?? 0) + row.count,
            );
        }

        const orderedKeys = [
            ...diseaseIdsRankedByVolume.slice(0, TOP_DISEASES_LIMIT),
            ...(hasOtherBucket ? [OTHER_DISEASES_ID] : []),
        ];

        return orderedKeys
            .filter((key) => seriesByDisease.has(key))
            .map((key) => {
                const series = seriesByDisease.get(key);
                return {
                    sicknessId: key,
                    sicknessName: series.sicknessName,
                    points: periods.map((period) => ({
                        period,
                        count: series.countsByPeriod.get(period) ?? 0,
                    })),
                };
            });
    }

    private buildDiseasePeakPeriods(
        diseasesRankedByVolume: { sicknessId: string; sicknessName: string }[],
        byDiseaseAndPeriod: DiseasePeriodCountRow[],
    ): DiseasePeakDto[] {
        const topDiseases = diseasesRankedByVolume.slice(0, TOP_DISEASES_LIMIT);

        return topDiseases
            .map((disease) => {
                const rows = byDiseaseAndPeriod.filter(
                    (row) => row.sicknessId === disease.sicknessId,
                );
                if (rows.length === 0) return null;

                const peak = rows.reduce((max, current) =>
                    current.count > max.count ? current : max,
                );

                return {
                    sicknessId: disease.sicknessId,
                    sicknessName: disease.sicknessName,
                    period: peak.period,
                    count: peak.count,
                };
            })
            .filter((peak): peak is DiseasePeakDto => peak !== null);
    }

    private buildEmptyDto(
        granularity: AnalyticsGranularity,
        distinctCropsCount: number,
    ): HistoryAnalyticsDto {
        return {
            totalAnalyses: 0,
            healthyCount: 0,
            diseasedCount: 0,
            averageCropConfidence: null,
            averageSicknessConfidence: null,
            distinctCropsCount,
            distinctDiseasesCount: 0,
            granularity,
            byDisease: [],
            byCrop: [],
            byPeriod: [],
            peakPeriod: null,
            diseaseIncidenceByPeriod: [],
            diseasePeakPeriods: [],
        };
    }
}
