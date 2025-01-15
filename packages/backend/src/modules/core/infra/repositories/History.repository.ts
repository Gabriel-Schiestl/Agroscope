import { Injectable } from '@nestjs/common';
import { HistoryRepository } from '../../domain/repositories/History.repository';
import { HistoryMapper } from '../mappers/History.mapper';
import { History } from '../../domain/models/History';
import { KnowledgeExceptions } from '../../domain/repositories/Knowledge.repository';
import { HistoryModel } from '../models/History.model';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';

@Injectable()
export class HistoryRepositoryImpl implements HistoryRepository {
    async save(history: History): Promise<KnowledgeExceptions | void> {
        const model = HistoryMapper.domainToModel(history);

        try {
            await model.save();
            return;
        } catch (error) {
            console.log(error);
            throw new Error('Error on save history');
        }
    }

    async getAll(): Promise<Error | History[]> {
        try {
            const models = await HistoryModel.find();

            if (models.length === 0) {
                throw new RepositoryNoDataFound('No data found');
            }

            return models.map((model) => HistoryMapper.modelToDomain(model));
        } catch (error) {
            throw new TechnicalException('Error on get all histories');
        }
    }

    async getById(id: string): Promise<Error | History> {
        try {
            const model = await HistoryModel.findOneBy({ id });
            if (!model) {
                throw new RepositoryNoDataFound('History not found');
            }

            return HistoryMapper.modelToDomain(model);
        } catch (error) {
            throw new TechnicalException('Error on get history by id');
        }
    }
}
