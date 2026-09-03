import { AbstractUseCase } from '../AbstractUseCase';
import { Res, Result } from '../Result';
import { BusinessException } from '../exceptions/Business.exception';

class SuccessUseCase extends AbstractUseCase<{ id: string }, never, string> {
    protected async onExecute(data: {
        id: string;
    }): Promise<Result<never, string>> {
        return Res.success(data.id);
    }
}

class FailureUseCase extends AbstractUseCase<void, BusinessException, void> {
    protected async onExecute(): Promise<Result<BusinessException, void>> {
        return Res.failure(new BusinessException('boom'));
    }
}

class ThrowingUseCase extends AbstractUseCase<void, never, void> {
    protected async onExecute(): Promise<Result<never, void>> {
        throw new Error('unexpected failure');
    }
}

describe('AbstractUseCase', () => {
    it('should return the result of a successful onExecute', async () => {
        const useCase = new SuccessUseCase();
        const result = await useCase.execute({ id: 'abc' });

        expect(result.isSuccess()).toBe(true);
        expect(result.isSuccess() && result.value).toBe('abc');
    });

    it('should return the result of a failing onExecute without throwing', async () => {
        const useCase = new FailureUseCase();
        const result = await useCase.execute();

        expect(result.isFailure()).toBe(true);
        expect(result.isFailure() && result.error).toBeInstanceOf(
            BusinessException,
        );
    });

    it('should rethrow when onExecute throws an unexpected error', async () => {
        const useCase = new ThrowingUseCase();

        await expect(useCase.execute()).rejects.toThrow(
            'unexpected failure',
        );
    });
});
