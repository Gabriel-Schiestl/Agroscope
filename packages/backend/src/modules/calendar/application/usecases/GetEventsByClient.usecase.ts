import { Inject, Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { CalendarRepository } from 'src/modules/calendar/domain/repositories/Calendar.repository';
import { CalendarEventAppMapper } from '../mappers/CalendarEvent.mapper';
import { CalendarEventDto } from '../dto/CalendarEvent.dto';

export type GetEventsByClientUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetEventsByClientUseCase extends AbstractUseCase<
    { userId: string; clientId: string },
    GetEventsByClientUseCaseExceptions,
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
        clientId,
    }: {
        userId: string;
        clientId: string;
    }): Promise<
        Result<GetEventsByClientUseCaseExceptions, CalendarEventDto[]>
    > {
        const calendar = await this.calendarRepository.findByUserId(userId);
        if (calendar.isFailure()) {
            return Res.failure(calendar.error);
        }

        return Res.success(
            calendar.value.events
                .filter((event) => event.clientId == clientId)
                .map((event) => CalendarEventAppMapper.toDto(event)),
        );
    }
}
