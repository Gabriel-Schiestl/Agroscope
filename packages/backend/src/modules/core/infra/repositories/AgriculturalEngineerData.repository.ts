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
import { Visit } from '../../domain/models/Visit';
import { Client } from '../../domain/models/Client';
import { ClientMapper } from '../mappers/Client.mapper';
import { ReportMapper } from '../mappers/Report.mapper';
import { Report } from '../../domain/models/Report';

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
                .leftJoinAndSelect(
                    'engineer.clients',
                    'clients',
                    'clients.id = :clientId',
                    { clientId },
                )
                .leftJoinAndSelect('clients.visits', 'visits')
                .where('engineer.id = :engineerId', {
                    engineerId,
                })
                .getRawMany();

            if (!models || models.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('AgriculturalEngineer not found'),
                );
            }

            const domainVisits = models
                .filter((visit) => visit.visits_id)
                .map((visit) => VisitMapper.modelToDomain(visit))
                .filter((visit): visit is Visit => visit !== null);

            return Res.success(domainVisits);
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
            const model = await AgriculturalEngineerModel.createQueryBuilder(
                'engineer',
            )
                .leftJoinAndSelect(
                    'engineer.clients',
                    'clients',
                    'clients.id = :clientId',
                    { clientId },
                )
                .leftJoinAndSelect(
                    'clients.visits',
                    'visits',
                    'visits.id = :visitId',
                    {
                        visitId,
                    },
                )
                .leftJoinAndSelect('visits.reports', 'reports')
                .where('engineer.id = :engineerId', {
                    engineerId,
                })
                .getRawMany();

            if (!model || model.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('AgriculturalEngineer not found'),
                );
            }

            const domainReports = model
                .filter((report) => report.reports_id)
                .map((report) => ReportMapper.modelToDomain(report))
                .filter((report): report is Report => report !== null);

            return Res.success(domainReports);
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
