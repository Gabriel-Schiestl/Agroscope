import { Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { History } from '../../domain/models/History';
import {
    AnalyticsGranularity,
    HistoryAnalyticsFilters,
    HistoryAnalyticsRaw,
    HistoryExceptions,
    HistoryFilters,
    HistoryRepository,
} from '../../domain/repositories/History.repository';
import { HistoryMapper } from '../mappers/History.mapper';
import { HistoryModel } from '../models/History.model';
import {
    Between,
    ILike,
    MoreThanOrEqual,
    LessThanOrEqual,
    FindOptionsWhere,
    SelectQueryBuilder,
} from 'typeorm';

const VALID_GRANULARITIES: AnalyticsGranularity[] = ['day', 'week', 'month'];

@Injectable()
export class HistoryRepositoryImpl implements HistoryRepository {
    async save(history: History): Promise<Result<HistoryExceptions, void>> {
        const model = HistoryMapper.domainToModel(history);
        console.log(model);
        try {
            const result = await model.save();

            if (!result) {
                return Res.failure(
                    new TechnicalException('Error on save history'),
                );
            }

            return Res.success();
        } catch (error) {
            return Res.failure(
                new TechnicalException('Error on save history' + error),
            );
        }
    }

    async getAll(): Promise<Result<HistoryExceptions, History[]>> {
        try {
            const models = await HistoryModel.find();

            return Res.success(
                models.map((model) => HistoryMapper.modelToDomain(model)),
            );
        } catch (error) {
            return Res.failure(
                new TechnicalException('Error on get all histories'),
            );
        }
    }

    async getById(id: string): Promise<Result<HistoryExceptions, History>> {
        try {
            const model = await HistoryModel.findOneBy({ id });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('History not found'),
                );
            }

            return Res.success(HistoryMapper.modelToDomain(model));
        } catch (error) {
            return Res.failure(
                new TechnicalException('Error on get history by id'),
            );
        }
    }

    async getByUserId(
        userId: string,
        filters?: HistoryFilters,
    ): Promise<Result<HistoryExceptions, History[]>> {
        try {
            const where: FindOptionsWhere<HistoryModel> = { userId };

            if (filters?.crop) {
                where.crop = ILike(`%${filters.crop}%`);
            }

            if (filters?.startDate && filters?.endDate) {
                where.createdAt = Between(filters.startDate, filters.endDate);
            } else if (filters?.startDate) {
                where.createdAt = MoreThanOrEqual(filters.startDate);
            } else if (filters?.endDate) {
                where.createdAt = LessThanOrEqual(filters.endDate);
            }

            const models = await HistoryModel.find({
                where,
                order: { createdAt: filters?.order ?? 'DESC' },
            });

            return Res.success(
                models.map((model) => HistoryMapper.modelToDomain(model)),
            );
        } catch (error) {
            return Res.failure(
                new TechnicalException('Error on get history by userId'),
            );
        }
    }

    async getAnalyticsByUserId(
        userId: string,
        filters: HistoryAnalyticsFilters,
    ): Promise<Result<HistoryExceptions, HistoryAnalyticsRaw>> {
        const granularity = VALID_GRANULARITIES.includes(filters.granularity)
            ? filters.granularity
            : 'month';

        try {
            const [totalsRow, byDisease, byCrop, byPeriod, byDiseaseAndPeriod] =
                await Promise.all([
                    this.scopedQuery(userId, filters)
                        .select('COUNT(*)', 'total')
                        .addSelect('COUNT(history.sicknessId)', 'diseasedCount')
                        .addSelect(
                            'AVG(history.cropConfidence)',
                            'averageCropConfidence',
                        )
                        .addSelect(
                            'AVG(history.sicknessConfidence)',
                            'averageSicknessConfidence',
                        )
                        .addSelect(
                            'COUNT(DISTINCT history.crop)',
                            'distinctCropsCount',
                        )
                        .addSelect(
                            'COUNT(DISTINCT history.sicknessId)',
                            'distinctDiseasesCount',
                        )
                        .getRawOne(),

                    this.scopedQuery(userId, filters)
                        .innerJoin('history.sickness_relation', 'sickness')
                        .select('history.sicknessId', 'sicknessId')
                        .addSelect('sickness.name', 'sicknessName')
                        .addSelect('COUNT(*)', 'count')
                        .groupBy('history.sicknessId')
                        .addGroupBy('sickness.name')
                        .orderBy('count', 'DESC')
                        .getRawMany(),

                    this.scopedQuery(userId, filters)
                        .select('history.crop', 'crop')
                        .addSelect('COUNT(*)', 'count')
                        .groupBy('history.crop')
                        .orderBy('count', 'DESC')
                        .getRawMany(),

                    this.scopedQuery(userId, filters)
                        .select(
                            "TO_CHAR(DATE_TRUNC(:granularity, history.createdAt), 'YYYY-MM-DD')",
                            'period',
                        )
                        .addSelect('COUNT(*)', 'count')
                        .setParameter('granularity', granularity)
                        .groupBy('period')
                        .orderBy('period', 'ASC')
                        .getRawMany(),

                    this.scopedQuery(userId, filters)
                        .innerJoin('history.sickness_relation', 'sickness')
                        .select('history.sicknessId', 'sicknessId')
                        .addSelect('sickness.name', 'sicknessName')
                        .addSelect(
                            "TO_CHAR(DATE_TRUNC(:granularity, history.createdAt), 'YYYY-MM-DD')",
                            'period',
                        )
                        .addSelect('COUNT(*)', 'count')
                        .setParameter('granularity', granularity)
                        .groupBy('history.sicknessId')
                        .addGroupBy('sickness.name')
                        .addGroupBy('period')
                        .orderBy('period', 'ASC')
                        .getRawMany(),
                ]);

            return Res.success({
                totals: {
                    total: Number(totalsRow?.total ?? 0),
                    diseasedCount: Number(totalsRow?.diseasedCount ?? 0),
                    averageCropConfidence:
                        totalsRow?.averageCropConfidence !== null &&
                        totalsRow?.averageCropConfidence !== undefined
                            ? Number(totalsRow.averageCropConfidence)
                            : null,
                    averageSicknessConfidence:
                        totalsRow?.averageSicknessConfidence !== null &&
                        totalsRow?.averageSicknessConfidence !== undefined
                            ? Number(totalsRow.averageSicknessConfidence)
                            : null,
                    distinctCropsCount: Number(
                        totalsRow?.distinctCropsCount ?? 0,
                    ),
                    distinctDiseasesCount: Number(
                        totalsRow?.distinctDiseasesCount ?? 0,
                    ),
                },
                byDisease: byDisease.map((row) => ({
                    sicknessId: row.sicknessId,
                    sicknessName: row.sicknessName,
                    count: Number(row.count),
                })),
                byCrop: byCrop.map((row) => ({
                    crop: row.crop,
                    count: Number(row.count),
                })),
                byPeriod: byPeriod.map((row) => ({
                    period: row.period,
                    count: Number(row.count),
                })),
                byDiseaseAndPeriod: byDiseaseAndPeriod.map((row) => ({
                    sicknessId: row.sicknessId,
                    sicknessName: row.sicknessName,
                    period: row.period,
                    count: Number(row.count),
                })),
            });
        } catch (error) {
            return Res.failure(
                new TechnicalException(
                    'Error on get history analytics' + error,
                ),
            );
        }
    }

    private scopedQuery(
        userId: string,
        filters: Pick<HistoryAnalyticsFilters, 'startDate' | 'endDate'>,
    ): SelectQueryBuilder<HistoryModel> {
        const qb = HistoryModel.createQueryBuilder('history').where(
            'history.userId = :userId',
            { userId },
        );

        if (filters.startDate) {
            qb.andWhere('history.createdAt >= :startDate', {
                startDate: filters.startDate,
            });
        }

        if (filters.endDate) {
            qb.andWhere('history.createdAt <= :endDate', {
                endDate: filters.endDate,
            });
        }

        return qb;
    }
}
