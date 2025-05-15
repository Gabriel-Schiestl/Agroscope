import { Inject, Injectable } from '@nestjs/common';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { Res, Result } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { CreateCalendarEventDto } from '../dto/CalendarEvent.dto';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { CalendarRepository } from '../../domain/repositories/Calendar.repository';

export type CreateEventUseCaseException = BusinessException;

@Injectable()
export class CreateEventUseCase extends AbstractUseCase<
    { userId: string; eventDto: CreateCalendarEventDto },
    CreateEventUseCaseException,
    void
> {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('CalendarRepository')
        private readonly calendarRepository: CalendarRepository,
    ) {
        super();
    }

    async onExecute({
        eventDto,
        userId,
    }: {
        userId: string;
        eventDto: CreateCalendarEventDto;
    }): Promise<Result<CreateEventUseCaseException, void>> {
        const user = await this.userRepository.getById(userId);
        if (user.isFailure()) {
            return Res.failure(user.error);
        }

        const calendar = await this.calendarRepository.findByUserId(
            user.value.id,
        );
        if (calendar.isFailure()) {
            return Res.failure(calendar.error);
        }

        const addEventResult = calendar.value.addEvent(eventDto);
        if (addEventResult.isFailure()) {
            return Res.failure(addEventResult.error);
        }

        const saveResult = await this.calendarRepository.save(calendar.value);
        if (saveResult.isFailure()) {
            return Res.failure(saveResult.error);
        }

        return Res.success();
    }
}
