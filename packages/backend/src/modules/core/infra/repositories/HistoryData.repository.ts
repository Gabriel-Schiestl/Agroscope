import { Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { History } from '../../domain/models/History';
import {
    HistoryExceptions,
    HistoryRepository,
} from '../../domain/repositories/History.repository';
import { HistoryMapper } from '../mappers/History.mapper';
import { HistoryModel } from '../models/History.model';

@Injectable()
export class HistoryRepositoryImpl implements HistoryRepository {
    async save(history: History): Promise<Result<HistoryExceptions, void>> {
        const model = HistoryMapper.domainToModel(history);
        console.log(model);
        try {
            const result = await model.save();

            if (!result) {
                return Res.failure(
                    new TechnicalException('Error on save history'),
                );
            }

            return Res.success();
        } catch (error) {
            return Res.failure(
                new TechnicalException('Error on save history' + error),
            );
        }
    }

    async getAll(): Promise<Result<HistoryExceptions, History[]>> {
        try {
            const models = await HistoryModel.find();

            if (models.length === 0) {
                return Res.failure(new RepositoryNoDataFound('No data found'));
            }

            return Res.success(
                models.map((model) => HistoryMapper.modelToDomain(model)),
            );
        } catch (error) {
            return Res.failure(
                new TechnicalException('Error on get all histories'),
            );
        }
    }

    async getById(id: string): Promise<Result<HistoryExceptions, History>> {
        try {
            const model = await HistoryModel.findOneBy({ id });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('History not found'),
                );
            }

            return Res.success(HistoryMapper.modelToDomain(model));
        } catch (error) {
            return Res.failure(
                new TechnicalException('Error on get history by id'),
            );
        }
    }

    async getByUserId(
        userId: string,
    ): Promise<Result<HistoryExceptions, History[]>> {
        try {
            const models = await HistoryModel.find({ where: { userId } });
            if (!models || models.length === 0) {
                return Res.failure(
                    new RepositoryNoDataFound('History not found'),
                );
            }

            return Res.success(
                models.map((model) => HistoryMapper.modelToDomain(model)),
            );
        } catch (error) {
            return Res.failure(
                new TechnicalException('Error on get history by userId'),
            );
        }
    }
}
