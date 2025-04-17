import { Inject, Injectable } from '@nestjs/common';
import { VisitRepository } from 'src/modules/core/domain/repositories/Visit.repository';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { ReportDto } from '../../dto/Report.dto';
import { ReportAppMapper } from '../../mappers/Report.mapper';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';

export type GetVisitsUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetReportsUseCase extends AbstractUseCase<
    { visitId: string },
    GetVisitsUseCaseExceptions,
    ReportDto[]
> {
    constructor(
        @Inject('VisitRepository')
        private readonly visitRepository: VisitRepository,
    ) {
        super();
    }

    async onExecute({
        visitId,
    }: {
        visitId: string;
    }): Promise<Result<GetVisitsUseCaseExceptions, ReportDto[]>> {
        const reports = await this.visitRepository.getReports(visitId);
        if (reports.isFailure()) {
            return Res.failure(reports.error);
        }

        return Res.success(
            reports.value.map((report) => ReportAppMapper.toDto(report)),
        );
    }
}
