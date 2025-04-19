import { Inject, Injectable } from '@nestjs/common';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { History } from '../../domain/models/History';
import { HistoryRepository } from '../../domain/repositories/History.repository';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';

export type GetHistoryUseCaseExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

@Injectable()
export class GetHistoryUseCase extends AbstractUseCase<
    { userId: string },
    GetHistoryUseCaseExceptions,
    History[]
> {
    constructor(
        @Inject('HistoryRepository')
        private readonly historyRepository: HistoryRepository,
    ) {
        super();
    }

    async onExecute({
        userId,
    }: {
        userId: string;
    }): Promise<Result<GetHistoryUseCaseExceptions, History[]>> {
        const history = await this.historyRepository.getByUserId(userId);
        if (history.isFailure()) {
            return Res.failure(history.error);
        }

        return Res.success(history.value);
    }
}
