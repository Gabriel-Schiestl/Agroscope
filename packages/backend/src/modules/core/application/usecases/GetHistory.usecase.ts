import { Inject, Injectable } from '@nestjs/common';
import { Failure, Success } from 'src/shared/Result';
import { History } from '../../domain/models/History';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { HistoryRepository } from '../../domain/repositories/History.repository';

export type GetHistoryUseCaseExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

@Injectable()
export class GetHistoryUseCase {
    constructor(
        @Inject('HistoryRepository')
        private readonly historyRepository: HistoryRepository,
    ) {}

    async execute(): Promise<
        Success<History[]> | Failure<GetHistoryUseCaseExceptions>
    > {
        const history = await this.historyRepository.getAll();

        if (history instanceof Failure) {
            return new Failure(history.error);
        }

        return new Success(history.data);
    }
}
