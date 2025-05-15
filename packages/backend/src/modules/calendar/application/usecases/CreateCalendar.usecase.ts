import { Inject, Injectable } from '@nestjs/common';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { Res, Result } from 'src/shared/Result';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { Calendar } from '../../domain/models/Calendar';
import { CalendarRepository } from '../../domain/repositories/Calendar.repository';

export type CreateCalendarUseCaseException = BusinessException;

@Injectable()
export class CreateCalendarUseCase extends AbstractUseCase<
    { userId: string },
    CreateCalendarUseCaseException,
    void
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
    }): Promise<Result<CreateCalendarUseCaseException, void>> {
        const calendar = Calendar.create({
            userId: userId,
        });
        if (calendar.isFailure()) return Res.failure(calendar.error);

        const saveCalendarResult = await this.calendarRepository.save(
            calendar.value,
        );
        if (saveCalendarResult.isFailure())
            return Res.failure(saveCalendarResult.error);

        return Res.success();
    }
}
