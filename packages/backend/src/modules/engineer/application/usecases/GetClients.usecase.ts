import { Inject, Injectable } from '@nestjs/common';
import { CalendarRepository } from 'src/modules/calendar/domain/repositories/Calendar.repository';
import { ReportRepository } from 'src/modules/core/domain/repositories/Report.repository';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { AgriculturalEngineerRepository } from '../../domain/repositories/AgriculturalEngineer.repository';
import { ClientDto } from '../dto/Client.dto';
import { ClientAppMapper } from '../mappers/Client.mapper';
import { ReportAppMapper } from '../mappers/Report.mapper';
import { CalendarEventAppMapper } from '../mappers/CalendarEvent.mapper';

export type GetClientsUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetClientsUseCase extends AbstractUseCase<
    { userId: string },
    GetClientsUseCaseExceptions,
    ClientDto[]
> {
    constructor(
        @Inject('AgriculturalEngineerRepository')
        private readonly engineerRepository: AgriculturalEngineerRepository,
        @Inject('CalendarRepository')
        private readonly calendarRepository: CalendarRepository,
        @Inject('ReportRepository')
        private readonly reportRepository: ReportRepository,
    ) {
        super();
    }

    async onExecute({
        userId,
    }: {
        userId: string;
    }): Promise<Result<GetClientsUseCaseExceptions, ClientDto[]>> {
        const engineer = await this.engineerRepository.getByUserId(userId);
        if (engineer.isFailure()) {
            return Res.failure(engineer.error);
        }

        const clients = await this.engineerRepository.getWithClients(
            engineer.value.id,
        );
        if (clients.isFailure()) {
            return Res.failure(clients.error);
        }

        const clientsDto = clients.value.map((client) =>
            ClientAppMapper.toDto(client),
        );

        for (const client of clientsDto) {
            const reportsToSet = [];
            const calendarEventsToSet = [];

            const calendarQuery = this.calendarRepository.findByUserId(userId);
            const reportsQuery = this.reportRepository.getByClientId(client.id);
            const [calendar, reports] = await Promise.all([
                calendarQuery,
                reportsQuery,
            ]);
            if (reports.isSuccess()) {
                reports.value.forEach((report) =>
                    reportsToSet.push(ReportAppMapper.toDto(report)),
                );
            }

            if (calendar.isSuccess()) {
                calendar.value.events
                    .filter((event) => event.clientId === client.id)
                    .forEach((event) =>
                        calendarEventsToSet.push(
                            CalendarEventAppMapper.toDto(event),
                        ),
                    );
            }
            client.calendarEvents = calendarEventsToSet;

            client.reports = reportsToSet;
        }

        return Res.success(clientsDto);
    }
}
