import { Inject, Injectable } from '@nestjs/common';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import {
    HistoryFilters,
    HistoryRepository,
} from '../../domain/repositories/History.repository';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { HistoryDto } from '../dto/History.dto';
import { HistoryAppMapper } from '../mappers/History.mapper';

export type GetHistoryUseCaseExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

export interface GetHistoryParams {
    userId: string;
    filters?: HistoryFilters;
}

@Injectable()
export class GetHistoryUseCase extends AbstractUseCase<
    GetHistoryParams,
    GetHistoryUseCaseExceptions,
    HistoryDto[]
> {
    constructor(
        @Inject('HistoryRepository')
        private readonly historyRepository: HistoryRepository,
    ) {
        super();
    }

    async onExecute({
        userId,
        filters,
    }: GetHistoryParams): Promise<Result<GetHistoryUseCaseExceptions, HistoryDto[]>> {
        const history = await this.historyRepository.getByUserId(
            userId,
            filters,
        );
        if (history.isFailure()) {
            return Res.failure(history.error);
        }

        return Res.success(history.value.map(HistoryAppMapper.toDto));
    }
}
