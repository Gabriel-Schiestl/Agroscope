import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Result } from 'src/shared/Result';
import { History } from '../models/History';

export type HistoryExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

export interface HistoryFilters {
    crop?: string;
    startDate?: Date;
    endDate?: Date;
    order?: 'ASC' | 'DESC';
}

export type AnalyticsGranularity = 'day' | 'week' | 'month';

export interface HistoryAnalyticsFilters {
    startDate?: Date;
    endDate?: Date;
    granularity: AnalyticsGranularity;
}

export interface HistoryAnalyticsTotals {
    total: number;
    diseasedCount: number;
    averageCropConfidence: number | null;
    averageSicknessConfidence: number | null;
    distinctCropsCount: number;
    distinctDiseasesCount: number;
}

export interface DiseaseCountRow {
    sicknessId: string;
    sicknessName: string;
    count: number;
}

export interface CropCountRow {
    crop: string;
    count: number;
}

export interface PeriodCountRow {
    period: string;
    count: number;
}

export interface DiseasePeriodCountRow {
    sicknessId: string;
    sicknessName: string;
    period: string;
    count: number;
}

export interface HistoryAnalyticsRaw {
    totals: HistoryAnalyticsTotals;
    byDisease: DiseaseCountRow[];
    byCrop: CropCountRow[];
    byPeriod: PeriodCountRow[];
    byDiseaseAndPeriod: DiseasePeriodCountRow[];
}

export interface HistoryRepository {
    save(history: History): Promise<Result<HistoryExceptions, void>>;
    getAll(): Promise<Result<HistoryExceptions, History[]>>;
    getById(id: string): Promise<Result<HistoryExceptions, History>>;
    getByUserId(
        userId: string,
        filters?: HistoryFilters,
    ): Promise<Result<HistoryExceptions, History[]>>;
    getAnalyticsByUserId(
        userId: string,
        filters: HistoryAnalyticsFilters,
    ): Promise<Result<HistoryExceptions, HistoryAnalyticsRaw>>;
}
