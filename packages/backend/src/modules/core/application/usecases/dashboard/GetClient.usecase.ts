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
import { VisitRepository } from 'src/modules/core/domain/repositories/Visit.repository';
import { VisitAppMapper } from '../../mappers/Visit.mapper';
import { ReportRepository } from 'src/modules/core/domain/repositories/Report.repository';
import { ReportAppMapper } from '../../mappers/Report.mapper';

export type GetClientUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetClientUseCase extends AbstractUseCase<
    { engineerId: string; clientId: string },
    GetClientUseCaseExceptions,
    ClientDto
> {
    constructor(
        @Inject('AgriculturalEngineerRepository')
        private readonly engineerRepository: AgriculturalEngineerRepository,
        @Inject('VisitRepository')
        private readonly visitRepository: VisitRepository,
        @Inject('ReportRepository')
        private readonly reportRepository: ReportRepository,
    ) {
        super();
    }

    async onExecute({
        engineerId,
        clientId,
    }: {
        engineerId: string;
        clientId: string;
    }): Promise<Result<GetClientUseCaseExceptions, ClientDto>> {
        const engineer = await this.engineerRepository.getByUserId(engineerId);
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

        const visitsQuery = this.visitRepository.getVisits(clientId);
        const reportsQuery = this.reportRepository.getByClientId(clientId);

        const [visits, reports] = await Promise.all([
            visitsQuery,
            reportsQuery,
        ]);

        if (visits.isSuccess()) {
            clientDto.visits = visits.value.map((visit) =>
                VisitAppMapper.toDto(visit),
            );
        }

        if (reports.isSuccess()) {
            clientDto.reports = reports.value.map((report) =>
                ReportAppMapper.toDto(report),
            );
        }

        return Res.success(clientDto);
    }
}
