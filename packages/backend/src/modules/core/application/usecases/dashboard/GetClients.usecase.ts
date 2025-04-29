import { Inject, Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { ClientDto } from '../../dto/Client.dto';
import { AgriculturalEngineerRepository } from 'src/modules/core/domain/repositories/AgriculturalEngineer.repository';
import { AgriculturalEngineerAppMapper } from '../../mappers/AgriculturalEngineer.mapper';
import { AgriculturalEngineerDto } from '../../dto/AgriculturalEngineer.dto';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { ClientAppMapper } from '../../mappers/Client.mapper';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { ReportRepository } from 'src/modules/core/domain/repositories/Report.repository';
import { ReportAppMapper } from '../../mappers/Report.mapper';
import { CalendarRepository } from 'src/modules/core/domain/repositories/Calendar.repository';
import { CalendarEventAppMapper } from '../../mappers/CalendarEvent.mapper';

export type GetClientesUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetClientesUseCase extends AbstractUseCase<
    { userId: string },
    GetClientesUseCaseExceptions,
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
    }): Promise<Result<GetClientesUseCaseExceptions, ClientDto[]>> {
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
                reports.value.map((report) =>
                    reportsToSet.push(ReportAppMapper.toDto(report)),
                );
            }

            if (calendar.isSuccess()) {
                calendar.value.events
                    .filter((event) => event.clientId === client.id)
                    .map((event) =>
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
