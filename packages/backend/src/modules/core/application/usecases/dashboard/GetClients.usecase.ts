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
            const visits = await this.visitRepository.getVisits(client.id);
            if (visits.isFailure()) {
                return Res.failure(visits.error);
            }
            client.visits = visits.value.map((visit) =>
                VisitAppMapper.toDto(visit),
            );
        }

        return Res.success(clientsDto);
    }
}
