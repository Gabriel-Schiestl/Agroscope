import { Injectable } from '@nestjs/common';
import {
    HistoryExceptions,
    HistoryRepository,
} from '../../domain/repositories/History.repository';
import { HistoryMapper } from '../mappers/History.mapper';
import { History } from '../../domain/models/History';
import { KnowledgeExceptions } from '../../domain/repositories/Knowledge.repository';
import { HistoryModel } from '../models/History.model';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Failure, Success } from 'src/shared/Result';

@Injectable()
export class HistoryRepositoryImpl implements HistoryRepository {
    async save(
        history: History,
    ): Promise<Success<void> | Failure<HistoryExceptions>> {
        const model = HistoryMapper.domainToModel(history);

        try {
            const result = await model.save();

            if (!result) {
                return new Failure(
                    new TechnicalException('Error on save history'),
                );
            }

            return new Success();
        } catch (error) {
            return new Failure(new TechnicalException('Error on save history'));
        }
    }

    async getAll(): Promise<Success<History[]> | Failure<HistoryExceptions>> {
        try {
            const models = await HistoryModel.find();

            if (models.length === 0) {
                return new Failure(new RepositoryNoDataFound('No data found'));
            }

            return new Success(
                models.map((model) => HistoryMapper.modelToDomain(model)),
            );
        } catch (error) {
            throw new TechnicalException('Error on get all histories');
        }
    }

    async getById(
        id: string,
    ): Promise<Success<History> | Failure<HistoryExceptions>> {
        try {
            const model = await HistoryModel.findOneBy({ id });
            if (!model) {
                throw new RepositoryNoDataFound('History not found');
            }

            return new Success(HistoryMapper.modelToDomain(model));
        } catch (error) {
            return new Failure(
                new TechnicalException('Error on get history by id'),
            );
        }
    }
}
