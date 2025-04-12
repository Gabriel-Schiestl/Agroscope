import { Inject, Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { ClientDto } from '../../dto/Client.dto';
import { AgriculturalEngineerRepository } from 'src/modules/core/domain/repositories/AgriculturalEngineer.repository';
import { AgriculturalEngineerAppMapper } from '../../mappers/AgriculturalEngineer.mapper';
import { AgriculturalEngineerDto } from '../../dto/AgriculturalEngineer.dto';
import { VisitAppMapper } from '../../mappers/Visit.mapper';
import { VisitDto } from '../../dto/Visit.dto';
export type GetVisitsUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetVisitsUseCase {
    constructor(
        @Inject('AgriculturalEngineerRepository')
        private readonly engineerRepository: AgriculturalEngineerRepository,
    ) {}

    async execute(
        engineerId: string,
        clientId: string,
    ): Promise<Result<GetVisitsUseCaseExceptions, VisitDto[]>> {
        const engineer = await this.engineerRepository.getByUserId(engineerId);
        if (engineer.isFailure()) {
            return Res.failure(engineer.error);
        }

        const visits = await this.engineerRepository.getVisits(
            engineer.value.id,
            clientId,
        );
        if (visits.isFailure()) {
            return Res.failure(visits.error);
        }

        return Res.success(
            visits.value.map((visit) => VisitAppMapper.toDto(visit)),
        );
    }
}
