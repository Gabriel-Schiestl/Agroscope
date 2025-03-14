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
}
