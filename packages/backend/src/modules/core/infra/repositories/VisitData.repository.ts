import { Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { Report } from '../../domain/models/Report';
import { Visit } from '../../domain/models/Visit';
import {
    VisitRepository,
    VisitRepositoryExceptions,
} from '../../domain/repositories/Visit.repository';
import { ReportMapper } from '../mappers/Report.mapper';
import { VisitMapper } from '../mappers/Visit.mapper';
import { ReportModel } from '../models/Report.model';
import { VisitModel } from '../models/Visit.model';

@Injectable()
export class VisitRepositoryImpl implements VisitRepository {
    async save(visit: Visit): Promise<Result<VisitRepositoryExceptions, void>> {
        try {
            const model = VisitMapper.domainToModel(visit);
            await model.save();

            return Res.success();
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getById(
        id: string,
    ): Promise<Result<VisitRepositoryExceptions, Visit>> {
        try {
            const model = await VisitModel.findOneBy({ id });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('Visit not found'),
                );
            }

            return Res.success(VisitMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getVisits(
        clientId: string,
    ): Promise<Result<VisitRepositoryExceptions, Visit[]>> {
        try {
            const models = await VisitModel.find({
                where: { clientId },
                order: { scheduledDate: 'DESC' },
            });

            if (!models || models.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('No visits found'),
                );
            }

            return Res.success(
                models.map((visit) => VisitMapper.modelToDomain(visit)),
            );
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getReports(
        visitId: string,
    ): Promise<Result<VisitRepositoryExceptions, Report[]>> {
        try {
            const models = await ReportModel.find({
                where: { visitId },
                relations: ['reports'],
            });

            if (!models) {
                return Res.failure(
                    new RepositoryNoDataFound('No reports found'),
                );
            }

            return Res.success(
                models.map((report) => ReportMapper.modelToDomain(report)),
            );
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getLastVisits(
        engineerId: string,
    ): Promise<Result<VisitRepositoryExceptions, Visit[]>> {
        try {
            const visits = await VisitModel.find({
                where: { engineerId },
                order: { scheduledDate: 'DESC' },
                take: 5,
            });

            if (!visits || visits.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('No visits found'),
                );
            }

            return Res.success(
                visits.map((visit) => VisitMapper.modelToDomain(visit)),
            );
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getReportsByEngineer(
        engineerId: string,
    ): Promise<Result<VisitRepositoryExceptions, Report[]>> {
        try {
            const reports = await ReportModel.find({
                where: { engineerId },
            });

            if (!reports || reports.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('No reports found'),
                );
            }

            return Res.success(
                reports.map((report) => ReportMapper.modelToDomain(report)),
            );
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }
}
