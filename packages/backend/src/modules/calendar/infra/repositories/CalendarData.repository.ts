import { Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { Calendar } from '../../domain/models/Calendar';
import {
    CalendarRepository,
    CalendarRepositoryExceptions,
} from '../../domain/repositories/Calendar.repository';
import { HistoryExceptions } from '../../../core/domain/repositories/History.repository';
import { CalendarMapper } from '../mappers/Calendar.mapper';
import { CalendarEvent } from '../../domain/models/CalendarEvent';
import { CalendarEventMapper } from '../mappers/CalendarEvent.mapper';
import { CalendarModel } from '../models/Calendar.model';

@Injectable()
export class CalendarRepositoryImpl implements CalendarRepository {
    async save(calendar: Calendar): Promise<Result<HistoryExceptions, void>> {
        const model = CalendarMapper.domainToModel(calendar);

        try {
            const result = await model.save();

            if (!result) {
                return Res.failure(
                    new TechnicalException('Error on save calendar'),
                );
            }

            return Res.success();
        } catch (error) {
            return Res.failure(
                new TechnicalException('Error on save calendar'),
            );
        }
    }

    async findByUserId(
        userId: string,
    ): Promise<Result<HistoryExceptions, Calendar>> {
        try {
            const model = await CalendarModel.findOne({
                where: {
                    userId,
                },
                relations: ['events'],
            });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('Calendar not found'),
                );
            }

            return Res.success(CalendarMapper.modelToDomain(model));
        } catch (error) {
            return Res.failure(
                new TechnicalException('Error on get calendar by userId'),
            );
        }
    }

    async getLastEvents(
        userId: string,
    ): Promise<Result<CalendarRepositoryExceptions, CalendarEvent[]>> {
        try {
            const model = await CalendarModel.findOne({
                where: {
                    userId,
                },
                relations: ['events'],
                order: {
                    events: {
                        date: 'DESC',
                    },
                },
            });
            if (!model) {
                return Res.failure(
                    new RepositoryNoDataFound('Calendar not found'),
                );
            }

            return Res.success(
                model.events
                    .slice(0, 5)
                    .map((event) => CalendarEventMapper.modelToDomain(event)),
            );
        } catch (error) {
            return Res.failure(
                new TechnicalException('Error on get calendar by userId'),
            );
        }
    }
}
