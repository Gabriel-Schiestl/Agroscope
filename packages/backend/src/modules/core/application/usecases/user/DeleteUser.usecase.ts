import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HistoryRepository } from 'src/modules/core/domain/repositories/History.repository';
import { UserRepository } from 'src/modules/core/domain/repositories/User.repository';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { BusinessException } from 'src/shared/exceptions/Business.exception';
import { RepositoryNoDataFound } from 'src/shared/exceptions/RepositoryNoDataFound.exception';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { Res, Result } from 'src/shared/Result';

export interface DeleteUserUseCaseProps {
    userId: string;
}

export type DeleteUserUseCaseExceptions =
    | RepositoryNoDataFound
    | BusinessException
    | TechnicalException;

@Injectable()
export class DeleteUserUseCase extends AbstractUseCase<
    DeleteUserUseCaseProps,
    DeleteUserUseCaseExceptions,
    void
> {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
        @Inject('HistoryRepository')
        private readonly historyRepository: HistoryRepository,
        private readonly eventEmitter: EventEmitter2,
    ) {
        super();
    }

    protected async onExecute(
        props: DeleteUserUseCaseProps,
    ): Promise<Result<DeleteUserUseCaseExceptions, void>> {
        const userResult = await this.userRepository.getById(props.userId);
        if (userResult.isFailure()) return Res.failure(userResult.error);

        const user = userResult.value;

        const historyResult = await this.historyRepository.deleteByUserId(
            user.id,
        );
        if (historyResult.isFailure()) return Res.failure(historyResult.error);

        const deleteResult = await this.userRepository.delete(user.id);
        if (deleteResult.isFailure()) return Res.failure(deleteResult.error);

        await this.eventEmitter.emitAsync('user.deleted', {
            id: user.id,
            email: user.email,
        });

        return Res.success();
    }
}
