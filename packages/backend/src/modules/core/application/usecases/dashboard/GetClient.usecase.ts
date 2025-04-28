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

        const visits = await this.visitRepository.getVisits(clientId);
        if (visits.isFailure()) {
            return Res.failure(visits.error);
        }

        for (const visit of visits.value) {
            const reports = await this.visitRepository.getReports(visit.id);
            if (reports.isFailure()) {
                return Res.failure(reports.error);
            }
            visit.setReports(reports.value);

            clientDto.visits.push(VisitAppMapper.toDto(visit));
        }

        return Res.success(clientDto);
    }
}
