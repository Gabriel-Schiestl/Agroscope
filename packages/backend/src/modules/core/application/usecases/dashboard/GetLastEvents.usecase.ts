import { Inject, Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { CalendarRepository } from 'src/modules/core/domain/repositories/Calendar.repository';
import { CalendarEventDto } from '../../dto/CalendarEvent.dto';
import { CalendarEventAppMapper } from '../../mappers/CalendarEvent.mapper';

export type GetLastEventsUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetLastEventsUseCase extends AbstractUseCase<
    { userId: string },
    GetLastEventsUseCaseExceptions,
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
    }): Promise<Result<GetLastEventsUseCaseExceptions, CalendarEventDto[]>> {
        const calendarEvents =
            await this.calendarRepository.getLastEvents(userId);
        if (calendarEvents.isFailure()) {
            return Res.failure(calendarEvents.error);
        }

        return Res.success(
            calendarEvents.value.map((event) =>
                CalendarEventAppMapper.toDto(event),
            ),
        );
    }
}
