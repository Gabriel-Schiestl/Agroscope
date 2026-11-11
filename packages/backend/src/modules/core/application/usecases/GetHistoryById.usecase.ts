import { Inject, Injectable } from '@nestjs/common';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { History } from '../../domain/models/History';
import { HistoryRepository } from '../../domain/repositories/History.repository';
import { HistoryDto } from '../dto/History.dto';
import { HistoryAppMapper } from '../mappers/History.mapper';
import { HistoryVisibilityService } from '../services/HistoryVisibility.service';

export type GetHistoryByIdExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

export interface GetHistoryByIdParams {
    id: string;
    userId: string;
}

@Injectable()
export class GetHistoryByIdUseCase extends AbstractUseCase<
    GetHistoryByIdParams,
    GetHistoryByIdExceptions,
    HistoryDto
> {
    constructor(
        @Inject('HistoryRepository')
        private readonly historyRepository: HistoryRepository,
        private readonly historyVisibility: HistoryVisibilityService,
    ) {
        super();
    }

    async onExecute({
        id,
        userId,
    }: GetHistoryByIdParams): Promise<Result<GetHistoryByIdExceptions, HistoryDto>> {
        const result = await this.historyRepository.getById(id);
        if (result.isFailure()) {
            return Res.failure(result.error);
        }

        const history: History = result.value;

        if (history.userId !== userId) {
            return Res.failure(
                new BusinessException('Análise não encontrada'),
            );
        }

        const visible = await this.historyVisibility.getVisibleIds(userId);
        if (visible.isFailure()) {
            return Res.failure(visible.error);
        }

        if (visible.value && !visible.value.includes(history.id)) {
            return Res.failure(
                new BusinessException(
                    'Seu plano guarda apenas a análise mais recente. Assine um plano pago para acessar o histórico completo.',
                ),
            );
        }

        return Res.success(HistoryAppMapper.toDto(history));
    }
}
