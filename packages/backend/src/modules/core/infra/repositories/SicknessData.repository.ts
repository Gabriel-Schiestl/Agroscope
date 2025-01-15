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

@Injectable()
export class SicknessDataRepository implements SicknessRepository {
    async getSickness(id: string): Promise<Sickness | SicknessExceptions> {
        try {
            const model = await SicknessModel.findOneBy({ id });
            if (!model) return new RepositoryNoDataFound('Sickness not found');

            return SicknessMapper.modelToDomain(model);
        } catch (e) {
            throw new TechnicalException(e.message);
        }
    }

    async getSicknessByName(
        name: string,
    ): Promise<Sickness | SicknessExceptions> {
        try {
            const model = await SicknessModel.createQueryBuilder('sickness')
                .where('LOWER(sickness.name) = LOWER(:name)', { name })
                .getOne();
            if (!model) return new RepositoryNoDataFound('Sickness not found');

            const domain = SicknessMapper.modelToDomain(model);

            return domain;
        } catch (e) {
            throw new TechnicalException(e.message);
        }
    }

    async save(sickness: Sickness): Promise<void | SicknessExceptions> {
        try {
            const model = SicknessMapper.domainToModel(sickness);

            const result = await model.save();

            return;
        } catch (e) {
            throw new TechnicalException(e.message);
        }
    }
}
