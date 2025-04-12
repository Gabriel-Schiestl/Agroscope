import { Injectable } from '@nestjs/common';
import {
    AgriculturalEngineerRepository,
    AgriculturalEngineerRepositoryExceptions,
} from '../../domain/repositories/AgriculturalEngineer.repository';
import { Res, Result } from 'src/shared/Result';
import { AgriculturalEngineer } from '../../domain/models/AgriculturalEngineer';
import { AgriculturalEngineerMapper } from '../mappers/AgriculturalEngineer.mapper';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { AgriculturalEngineerModel } from '../models/AgriculturalEngineer.model';
import { VisitMapper } from '../mappers/Visit.mapper';
import { Visit, VisitStatus } from '../../domain/models/Visit';
import { Client } from '../../domain/models/Client';
import { ClientMapper } from '../mappers/Client.mapper';
import { ReportMapper } from '../mappers/Report.mapper';
import { Report, ReportStatus } from '../../domain/models/Report';
import { VisitModel } from '../models/Visit.model';
import { ReportModel } from '../models/Report.model';

@Injectable()
export class AgriculturalEngineerImpl
    implements AgriculturalEngineerRepository
{
    async save(
        agriculturalEngineer: AgriculturalEngineer,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, void>> {
        try {
            const model =
                AgriculturalEngineerMapper.domainToModel(agriculturalEngineer);
            await model.save();

            return Res.success();
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getById(
        id: string,
    ): Promise<
        Result<AgriculturalEngineerRepositoryExceptions, AgriculturalEngineer>
    > {
        try {
            const model = await AgriculturalEngineerModel.findOneBy({ id });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('AgriculturalEngineer not found'),
                );
            }

            return Res.success(AgriculturalEngineerMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async delete(
        id: string,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, void>> {
        try {
            const model = await AgriculturalEngineerModel.findOneBy({ id });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('AgriculturalEngineer not found'),
                );
            }

            await model.remove();

            return Res.success();
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getByUserId(
        userId: string,
    ): Promise<
        Result<AgriculturalEngineerRepositoryExceptions, AgriculturalEngineer>
    > {
        try {
            const model = await AgriculturalEngineerModel.findOneBy({ userId });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('AgriculturalEngineer not found'),
                );
            }

            return Res.success(AgriculturalEngineerMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getWithClients(
        engineerId: string,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Client[]>> {
        try {
            const model = await AgriculturalEngineerModel.findOne({
                where: { id: engineerId },
                relations: ['clients'],
            });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('AgriculturalEngineer not found'),
                );
            }

            if (!model.clients || model.clients.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('No clients found'),
                );
            }

            return Res.success(
                model.clients?.map((client) =>
                    ClientMapper.modelToDomain(client),
                ),
            );
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getVisits(
        engineerId: string,
        clientId: string,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Visit[]>> {
        try {
            const models = await AgriculturalEngineerModel.createQueryBuilder(
                'engineer',
            )
                .leftJoinAndSelect('engineer.clients', 'clients')
                .leftJoinAndSelect('clients.visits', 'visits')
                .where('engineer.id = :engineerId', { engineerId })
                .andWhere('clients.id = :clientId', { clientId })
                .select([
                    'visits.id',
                    'visits.scheduledDate',
                    'visits.status',
                    'visits.notes',
                    'visits.created_at',
                    'visits.updated_at',
                ])
                .getRawMany();

            if (!models || models.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('No visits found'),
                );
            }

            const validVisits = models.filter(
                (model) => model.reports_id !== null,
            );

            if (validVisits.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('No visits found'),
                );
            }

            const formattedVisits: VisitModel[] = validVisits.map((model) =>
                new VisitModel().setProps({
                    id: model.visits_id as string,
                    status: model.visits_status as VisitStatus,
                    scheduledDate: model.visits_scheduledDate as Date,
                    notes: model.visits_notes as string,
                    createdAt: model.visits_created_at as Date,
                }),
            );

            return Res.success(
                formattedVisits.map((visit) =>
                    VisitMapper.modelToDomain(visit),
                ),
            );
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getReports(
        engineerId: string,
        clientId: string,
        visitId: string,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Report[]>> {
        try {
            const models = await AgriculturalEngineerModel.createQueryBuilder(
                'engineer',
            )
                .leftJoinAndSelect('engineer.clients', 'clients')
                .leftJoinAndSelect('clients.visits', 'visits')
                .leftJoinAndSelect('visits.reports', 'reports')
                .where('engineer.id = :engineerId', { engineerId })
                .andWhere('clients.id = :clientId', { clientId })
                .andWhere('visits.id = :visitId', { visitId })
                .select([
                    'reports.id',
                    'reports.title',
                    'reports.content',
                    'reports.status',
                    'reports.attachments',
                    'reports.created_at',
                ])
                .getRawMany();

            if (!models || models.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('No reports found'),
                );
            }
            console.log(models);
            const validReports = models.filter(
                (model) => model.reports_id !== null,
            );

            if (validReports.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('No reports found'),
                );
            }

            const formattedReports: ReportModel[] = validReports.map((model) =>
                new ReportModel().setProps({
                    id: model.reports_id as string,
                    title: model.reports_title as string,
                    content: model.reports_content as string,
                    status: model.reports_status as ReportStatus,
                    attachments: model.reports_attachments as string[],
                    createdAt: model.created_at as Date,
                }),
            );

            return Res.success(
                formattedReports.map((report) =>
                    ReportMapper.modelToDomain(report),
                ),
            );
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }

    async getLastVisits(
        engineerId: string,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Visit[]>> {
        try {
            const visits = await AgriculturalEngineerModel.createQueryBuilder(
                'engineer',
            )
                .leftJoinAndSelect('engineer.clients', 'clients')
                .leftJoinAndSelect('clients.visits', 'visits')
                .where('engineer.id = :engineerId', { engineerId })
                .orderBy('visits.created_at', 'DESC')
                .take(5)
                .getRawMany();

            if (!visits || visits.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound(
                        'No visits found for the engineer',
                    ),
                );
            }

            return Res.success(
                visits.map((visit) => VisitMapper.modelToDomain(visit)),
            );
        } catch (e) {
            return Res.failure(new TechnicalException(e));
        }
    }
}
