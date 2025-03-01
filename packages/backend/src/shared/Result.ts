import { Exception } from './Exception';

export type Result<E, T> = Success<T> | Failure<E>;

export interface IResult<E, T> {
    isSuccess(): this is Success<T>;
    isFailure(): this is Failure<E>;
}

export class Success<T> implements IResult<never, T> {
    readonly value: T;

    constructor(value: T) {
        this.value = value;
    }

    isSuccess(): this is Success<T> {
        return true;
    }

    isFailure(): this is Failure<never> {
        return false;
    }
}

export class Failure<E> implements IResult<E, never> {
    readonly error: E;
    constructor(error: E) {
        this.error = error;
    }

    isSuccess(): this is Success<never> {
        return false;
    }

    isFailure(): this is Failure<E> {
        return true;
    }
}

export abstract class Res {
    static success(): Result<never, void>;
    static success<T>(value: T): Result<never, T>;
    static success<T>(value?: T): Result<never, T> {
        return new Success(value!);
    }

    static failure<E extends Exception>(error: E): Result<E, never> {
        return new Failure(error);
    }
}
