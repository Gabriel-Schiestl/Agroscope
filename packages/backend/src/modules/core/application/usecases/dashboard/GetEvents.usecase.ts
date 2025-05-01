import { Inject, Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { CalendarRepository } from 'src/modules/core/domain/repositories/Calendar.repository';
import { CalendarEventDto } from '../../dto/CalendarEvent.dto';
import { CalendarEventAppMapper } from '../../mappers/CalendarEvent.mapper';

export type GetEventsUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetEventsUseCase extends AbstractUseCase<
    { userId: string },
    GetEventsUseCaseExceptions,
    CalendarEventDto[]
> {
    constructor(
        @Inject('CalendarRepository')
        private readonly calendarRepository: CalendarRepository,
    ) {
        super();
    }

    async onExecute({
        userId,
    }: {
        userId: string;
    }): Promise<Result<GetEventsUseCaseExceptions, CalendarEventDto[]>> {
        const calendar = await this.calendarRepository.findByUserId(userId);
        if (calendar.isFailure()) {
            return Res.failure(calendar.error);
        }

        return Res.success(
            calendar.value.events.map((event) =>
                CalendarEventAppMapper.toDto(event),
            ),
        );
    }
}
