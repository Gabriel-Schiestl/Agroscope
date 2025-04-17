import { Inject, Injectable } from '@nestjs/common';
import { VisitRepository } from 'src/modules/core/domain/repositories/Visit.repository';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { VisitDto } from '../../dto/Visit.dto';
import { VisitAppMapper } from '../../mappers/Visit.mapper';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
export type GetVisitsUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetVisitsUseCase extends AbstractUseCase<
    { clientId: string },
    GetVisitsUseCaseExceptions,
    VisitDto[]
> {
    constructor(
        @Inject('VisitRepository')
        private readonly visitRepository: VisitRepository,
    ) {
        super();
    }

    async onExecute({
        clientId,
    }: {
        clientId: string;
    }): Promise<Result<GetVisitsUseCaseExceptions, VisitDto[]>> {
        const visits = await this.visitRepository.getVisits(clientId);
        if (visits.isFailure()) {
            return Res.failure(visits.error);
        }

        return Res.success(
            visits.value.map((visit) => VisitAppMapper.toDto(visit)),
        );
    }
}
