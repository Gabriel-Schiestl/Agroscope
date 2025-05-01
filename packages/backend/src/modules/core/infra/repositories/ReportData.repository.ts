import { Injectable } from '@nestjs/common';
import {
    HistoryExceptions,
    HistoryRepository,
} from '../../domain/repositories/History.repository';
import { HistoryMapper } from '../mappers/History.mapper';
import { History } from '../../domain/models/History';
import { KnowledgeExceptions } from '../../domain/repositories/Knowledge.repository';
import { HistoryModel } from '../models/History.model';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Failure, Res, Result, Success } from 'src/shared/Result';
import {
    ReportExceptions,
    ReportRepository,
} from '../../domain/repositories/Report.repository';
import { Report } from '../../domain/models/Report';
import { ReportMapper } from '../mappers/Report.mapper';
import { ReportModel } from '../models/Report.model';

@Injectable()
export class ReportRepositoryImpl implements ReportRepository {
    async save(report: Report): Promise<Result<ReportExceptions, void>> {
        try {
            const reportModel = ReportMapper.domainToModel(report);
            await reportModel.save();
            return Res.success();
        } catch (error) {
            return Res.failure(new TechnicalException(error.message));
        }
    }

    async getByEngineerId(
        engineerId: string,
    ): Promise<Result<ReportExceptions, Report[]>> {
        try {
            const reports = await ReportModel.find({
                where: { engineerId },
            });
            if (reports.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('No reports found'),
                );
            }
            return Res.success(reports.map(ReportMapper.modelToDomain));
        } catch (error) {
            return Res.failure(new TechnicalException(error.message));
        }
    }

    async getByEventId(
        eventId: string,
    ): Promise<Result<ReportExceptions, Report[]>> {
        try {
            const reports = await ReportModel.find({
                where: { eventId },
            });
            if (reports.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('No reports found'),
                );
            }
            return Res.success(reports.map(ReportMapper.modelToDomain));
        } catch (error) {
            return Res.failure(new TechnicalException(error.message));
        }
    }

    async getByClientId(
        clientId: string,
    ): Promise<Result<ReportExceptions, Report[]>> {
        try {
            const reports = await ReportModel.find({
                where: { clientId },
            });
            if (reports.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('No reports found'),
                );
            }
            return Res.success(reports.map(ReportMapper.modelToDomain));
        } catch (error) {
            return Res.failure(new TechnicalException(error.message));
        }
    }
}
