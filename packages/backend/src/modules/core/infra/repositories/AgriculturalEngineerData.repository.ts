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
import { Client, Crop } from '../../domain/models/Client';
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
        clientId: string,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Visit[]>> {
        try {
            const models = await VisitModel.find({
                where: { clientId },
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
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Report[]>> {
        try {
            const model = await VisitModel.findOne({
                where: { id: visitId },
                relations: ['reports'],
            });

            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('No reports found'),
                );
            }

            return Res.success(
                model.reports.map((report) =>
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

    async getClientsByCrop(
        engineerId: string,
        crop: Crop,
    ): Promise<Result<AgriculturalEngineerRepositoryExceptions, Client[]>> {
        try {
            const model = await AgriculturalEngineerModel.findOne({
                where: { id: engineerId, clients: { actualCrop: crop } },
                relations: ['clients'],
            });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('No clients found'),
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
}
