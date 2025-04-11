import { Inject, Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { ClientDto } from '../../dto/Client.dto';
import { AgriculturalEngineerRepository } from 'src/modules/core/domain/repositories/AgriculturalEngineer.repository';
import { AgriculturalEngineerAppMapper } from '../../mappers/AgriculturalEngineer.mapper';
import { AgriculturalEngineerDto } from '../../dto/AgriculturalEngineer.dto';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { VisitDto } from '../../dto/Visit.dto';
import { VisitAppMapper } from '../../mappers/Visit.mapper';

export type GetLastVisitsUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetLastVisitsUseCase {
    constructor(
        @Inject('AgriculturalEngineerRepository')
        private readonly engineerRepository: AgriculturalEngineerRepository,
    ) {}

    async execute(
        engineerId: string,
    ): Promise<Result<GetLastVisitsUseCaseExceptions, VisitDto[]>> {
        const engineer = await this.engineerRepository.getByUserId(engineerId);
        if (engineer.isFailure()) {
            return Res.failure(engineer.error);
        }

        const visits = await this.engineerRepository.getLastVisits(
            engineer.value.id,
        );
        if (visits.isFailure()) {
            return Res.failure(visits.error);
        }

        return Res.success(
            visits.value.map((vist) => VisitAppMapper.toDto(vist)),
        );
    }
}
