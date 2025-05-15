import { Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { AgriculturalEngineer } from '../../domain/models/AgriculturalEngineer';
import { Client, Crop } from '../../domain/models/Client';
import {
    AgriculturalEngineerRepository,
    AgriculturalEngineerRepositoryExceptions,
} from '../../domain/repositories/AgriculturalEngineer.repository';
import { AgriculturalEngineerMapper } from '../mappers/AgriculturalEngineer.mapper';
import { AgriculturalEngineerModel } from '../models/AgriculturalEngineer.model';
import { ClientMapper } from '../mappers/Client.mapper';

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
