import { Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Sickness } from '../../domain/models/Sickness';
import {
    SicknessExceptions,
    SicknessRepository,
} from '../../domain/repositories/Sickness.repository';
import { SicknessMapper } from '../mappers/Sickness.mapper';
import { SicknessModel } from '../models/Sickness.model';
import { Res, Result } from 'src/shared/Result';

@Injectable()
export class SicknessDataRepository implements SicknessRepository {
    async getSickness(
        id: string,
    ): Promise<Result<SicknessExceptions, Sickness>> {
        try {
            const model = await SicknessModel.findOneBy({ id });
            if (!model)
                return Res.failure(
                    new RepositoryNoDataFound('Sickness not found'),
                );

            return Res.success(SicknessMapper.modelToDomain(model));
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }

    async getSicknessByName(
        name: string,
    ): Promise<Result<SicknessExceptions, Sickness>> {
        try {
            const model = await SicknessModel.createQueryBuilder('sickness')
                .where('LOWER(sickness.name) = LOWER(:name)', { name })
                .getOne();
            if (!model)
                return Res.failure(
                    new RepositoryNoDataFound('Sickness not found'),
                );

            const domain = SicknessMapper.modelToDomain(model);

            return Res.success(domain);
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }

    async save(sickness: Sickness): Promise<Result<TechnicalException, void>> {
        try {
            const model = SicknessMapper.domainToModel(sickness);

            await model.save();

            return Res.success();
        } catch (e) {
            return Res.failure(new TechnicalException(e.message));
        }
    }
}
