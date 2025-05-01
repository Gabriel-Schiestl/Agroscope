import { Inject, Injectable } from '@nestjs/common';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { ReportDto } from '../../dto/Report.dto';
import { ReportAppMapper } from '../../mappers/Report.mapper';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { ReportRepository } from 'src/modules/core/domain/repositories/Report.repository';

export type GetVisitsUseCaseExceptions =
    | RepositoryNoDataFound
    | TechnicalException;

@Injectable()
export class GetReportsUseCase extends AbstractUseCase<
    { eventId: string },
    GetVisitsUseCaseExceptions,
    ReportDto[]
> {
    constructor(
        @Inject('ReportRepository')
        private readonly reportRepository: ReportRepository,
    ) {
        super();
    }

    async onExecute({
        eventId,
    }: {
        eventId: string;
    }): Promise<Result<GetVisitsUseCaseExceptions, ReportDto[]>> {
        const reports = await this.reportRepository.getByEventId(eventId);
        if (reports.isFailure()) {
            return Res.failure(reports.error);
        }

        return Res.success(
            reports.value.map((report) => ReportAppMapper.toDto(report)),
        );
    }
}
