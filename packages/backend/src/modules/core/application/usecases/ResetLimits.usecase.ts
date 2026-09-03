import { Inject, Injectable } from '@nestjs/common';
import { AbstractUseCase } from 'src/shared/AbstractUseCase';
import { Exception } from 'src/shared/Exception';
import { Res, Result } from 'src/shared/Result';
import { UserRepository } from '../../domain/repositories/User.repository';

@Injectable()
export class ResetLimitsUseCase extends AbstractUseCase<void, Exception, void> {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) {
        super();
    }

    protected async onExecute(): Promise<Result<Exception, void>> {
        const result = await this.userRepository.resetAllLimits();
        if (result.isFailure()) {
            return Res.failure(result.error);
        }

        return Res.success();
    }
}
