import { Result } from './Result';

export abstract class AbstractUseCase<P, E, R> {
    abstract execute(data: P): Promise<Result<E, R>>;
}
