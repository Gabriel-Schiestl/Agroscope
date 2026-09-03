import { Res } from 'src/shared/Result';
import { TechnicalException } from 'src/shared/exceptions/Technical.exception';
import { ResetLimitsUseCase } from '../../../application/usecases/ResetLimits.usecase';
import { LimitResetJob } from '../LimitReset.job';

describe('LimitResetJob', () => {
    let resetLimitsUseCase: jest.Mocked<ResetLimitsUseCase>;
    let job: LimitResetJob;

    beforeEach(() => {
        resetLimitsUseCase = {
            execute: jest.fn().mockResolvedValue(Res.success(undefined)),
        } as unknown as jest.Mocked<ResetLimitsUseCase>;
        job = new LimitResetJob(resetLimitsUseCase);
    });

    it('should call ResetLimitsUseCase on the cron tick', async () => {
        await job.handleCron();
        expect(resetLimitsUseCase.execute).toHaveBeenCalled();
    });

    it('should not throw when the use case fails', async () => {
        resetLimitsUseCase.execute.mockResolvedValue(
            Res.failure(new TechnicalException('db error')),
        );

        await expect(job.handleCron()).resolves.toBeUndefined();
    });
});
