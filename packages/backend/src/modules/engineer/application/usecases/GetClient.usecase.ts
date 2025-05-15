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
import { CalendarEventAppMapper } from '../mappers/CalendarEvent.mapper';
import { ReportAppMapper } from '../mappers/Report.mapper';

export type GetClientUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetClientUseCase extends AbstractUseCase<
    { userId: string; clientId: string },
    GetClientUseCaseExceptions,
    ClientDto
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
        clientId,
    }: {
        userId: string;
        clientId: string;
    }): Promise<Result<GetClientUseCaseExceptions, ClientDto>> {
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

        const client = clients.value.find((client) => client.id === clientId);

        const clientDto = ClientAppMapper.toDto(client);

        const calendarQuery = this.calendarRepository.findByUserId(userId);
        const reportsQuery = this.reportRepository.getByClientId(clientId);

        const [calendar, reports] = await Promise.all([
            calendarQuery,
            reportsQuery,
        ]);

        if (calendar.isSuccess()) {
            clientDto.calendarEvents = calendar.value.events
                .filter((event) => event.clientId === clientId)
                .map((event) => CalendarEventAppMapper.toDto(event));
        }

        if (reports.isSuccess()) {
            clientDto.reports = reports.value.map((report) =>
                ReportAppMapper.toDto(report),
            );
        }

        return Res.success(clientDto);
    }
}
