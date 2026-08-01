import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ResetLimitsUseCase } from '../../application/usecases/ResetLimits.usecase';

@Injectable()
export class LimitResetJob {
    private readonly logger = new Logger(LimitResetJob.name);

    constructor(private readonly resetLimitsUseCase: ResetLimitsUseCase) {}

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async handleCron(): Promise<void> {
        const result = await this.resetLimitsUseCase.execute();
        if (result.isFailure()) {
            this.logger.error(
                `Falha ao resetar limites dos usuários: ${JSON.stringify(result.error)}`,
            );
            return;
        }

        this.logger.log('Limites de uso dos usuários resetados com sucesso');
    }
}
