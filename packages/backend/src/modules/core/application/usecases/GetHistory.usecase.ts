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
import { HistoryVisibilityService } from '../services/HistoryVisibility.service';

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
        private readonly historyVisibility: HistoryVisibilityService,
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

        const visible = await this.historyVisibility.getVisibleIds(userId);
        if (visible.isFailure()) {
            return Res.failure(visible.error);
        }

        const visibleIds = visible.value;
        const items = visibleIds
            ? history.value.filter((h) => visibleIds.includes(h.id))
            : history.value;

        return Res.success(items.map(HistoryAppMapper.toDto));
    }
}
