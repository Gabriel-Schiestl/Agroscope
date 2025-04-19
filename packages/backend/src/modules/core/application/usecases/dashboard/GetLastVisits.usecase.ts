import { Inject, Injectable } from '@nestjs/common';
import { AgriculturalEngineerRepository } from 'src/modules/core/domain/repositories/AgriculturalEngineer.repository';
import { VisitRepository } from 'src/modules/core/domain/repositories/Visit.repository';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { VisitDto } from '../../dto/Visit.dto';
import { VisitAppMapper } from '../../mappers/Visit.mapper';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';

export type GetLastVisitsUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetLastVisitsUseCase extends AbstractUseCase<
    { engineerId: string },
    GetLastVisitsUseCaseExceptions,
    VisitDto[]
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
    }): Promise<Result<GetLastVisitsUseCaseExceptions, VisitDto[]>> {
        const engineer = await this.engineerRepository.getByUserId(engineerId);
        if (engineer.isFailure()) {
            return Res.failure(engineer.error);
        }

        const visits = await this.visitRepository.getLastVisits(
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
