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

export type GetClientesUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetClientesUseCase extends AbstractUseCase<
    { engineerId: string },
    GetClientesUseCaseExceptions,
    ClientDto[]
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
    }: {
        engineerId: string;
    }): Promise<Result<GetClientesUseCaseExceptions, ClientDto[]>> {
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

        const clientsDto = clients.value.map((client) =>
            ClientAppMapper.toDto(client),
        );

        for (const client of clientsDto) {
            const reportsToSet = [];
            const visitsToSet = [];

            const visitsQuery = this.visitRepository.getVisits(client.id);
            const reportsQuery = this.reportRepository.getByClientId(client.id);
            const [visits, reports] = await Promise.all([
                visitsQuery,
                reportsQuery,
            ]);
            if (reports.isSuccess()) {
                reports.value.map((report) =>
                    reportsToSet.push(ReportAppMapper.toDto(report)),
                );
            }

            if (visits.isSuccess()) {
                visits.value.map((visit) =>
                    visitsToSet.push(VisitAppMapper.toDto(visit)),
                );
            }
            client.visits = visitsToSet;

            client.reports = reportsToSet;
        }

        return Res.success(clientsDto);
    }
}
