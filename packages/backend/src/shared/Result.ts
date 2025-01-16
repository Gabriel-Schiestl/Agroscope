export class Success<T = void> {
    private readonly _data: T | null;

    constructor(data?: T) {
        this._data = data || null;
    }

    get data(): T {
        return this._data;
    }
}

export class Failure<T> {
    private readonly _error: T;

    constructor(error: T) {
        this._error = error;
    }

    get error(): T {
        return this._error;
    }
}
