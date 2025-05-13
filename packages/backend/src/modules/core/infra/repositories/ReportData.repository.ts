import { Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { Report } from '../../domain/models/Report';
import {
    ReportExceptions,
    ReportRepository,
} from '../../domain/repositories/Report.repository';
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
